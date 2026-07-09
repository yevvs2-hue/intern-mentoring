import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ZipArchive } from "archiver";
import { PassThrough, Readable } from "stream";
import { readStore } from "@/lib/store";
import { MentoringPDF, SeniorPDF } from "@/lib/pdf-templates";
import { MentoringSubmission, PhotoSubmission, SeniorSubmission } from "@/types";
import React from "react";
import fs from "fs";
import path from "path";

async function resolvePhotos(photos: PhotoSubmission[]) {
  return Promise.all(photos.map(async (p) => {
    try {
      if (p.fileUrl.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", p.fileUrl);
        const buffer = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return { ...p, fileUrl: `data:${contentType};base64,${buffer.toString("base64")}` };
      }
      const res = await fetch(p.fileUrl, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      if (!res.ok) return null;
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const contentType = res.headers.get("content-type") || "image/jpeg";
      return { ...p, fileUrl: `data:${contentType};base64,${base64}` };
    } catch {
      return null;
    }
  })).then((r) => r.filter(Boolean) as PhotoSubmission[]);
}

async function renderMentoringPdf(s: MentoringSubmission, photos: PhotoSubmission[]) {
  const stream = await renderToStream(React.createElement(MentoringPDF, { s, photos }) as React.ReactElement<never>);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function renderSeniorPdf(s: SeniorSubmission, photos: PhotoSubmission[]) {
  const stream = await renderToStream(React.createElement(SeniorPDF, { s, photos }) as React.ReactElement<never>);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "mentoring" | "senior"

  if (type !== "mentoring" && type !== "senior") {
    return NextResponse.json({ error: "type은 mentoring 또는 senior여야 합니다." }, { status: 400 });
  }

  const store = await readStore();
  const submissions = type === "mentoring" ? store.mentoring : store.senior;

  if (submissions.length === 0) {
    return NextResponse.json({ error: "다운로드할 활동일지가 없습니다." }, { status: 404 });
  }

  const pass = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 6 } });

  archive.on("error", (err) => { throw err; });
  archive.pipe(pass);

  const usedNames = new Set<string>();
  for (const s of submissions) {
    try {
      const rawPhotos = (store.photos ?? []).filter((p) =>
        p.type === type &&
        (p.submissionId ? p.submissionId === s.id : p.employeeId === s.employeeId && p.date === s.date)
      );
      const photos = await resolvePhotos(rawPhotos);

      const buffer = type === "mentoring"
        ? await renderMentoringPdf(s as MentoringSubmission, photos)
        : await renderSeniorPdf(s as SeniorSubmission, photos);

      const label = type === "mentoring" ? "멘토링활동일지" : "선배탐구";
      let safeName = `${s.date}_${s.internName}_${label}.pdf`;
      let suffix = 2;
      while (usedNames.has(safeName)) {
        safeName = `${s.date}_${s.internName}_${label}_${suffix}.pdf`;
        suffix++;
      }
      usedNames.add(safeName);

      archive.append(Readable.from(buffer), { name: safeName });
    } catch {
      continue;
    }
  }

  archive.finalize();

  const chunks: Buffer[] = [];
  for await (const chunk of pass) {
    chunks.push(chunk as Buffer);
  }
  const buffer = Buffer.concat(chunks);

  const label = type === "mentoring" ? "멘토링" : "선배탐구";
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`활동일지PDF_${label}.zip`)}`,
    },
  });
}
