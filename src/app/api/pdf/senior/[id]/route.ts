import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { readStore } from "@/lib/store";
import { SeniorPDF } from "@/lib/pdf-templates";
import { PhotoSubmission } from "@/types";
import React from "react";

async function resolvePhotos(photos: PhotoSubmission[]) {
  return Promise.all(photos.map(async (p) => {
    try {
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const s = store.senior.find((m) => m.id === id);

  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rawPhotos = (store.photos ?? []).filter(
    (p) => p.type === "senior" && p.employeeId === s.employeeId && p.date === s.date
  );
  const photos = await resolvePhotos(rawPhotos);

  const stream = await renderToStream(React.createElement(SeniorPDF, { s, photos }) as React.ReactElement<never>);

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  const filename = encodeURIComponent(`선배탐구_${s.internName}_${s.date}.pdf`);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
