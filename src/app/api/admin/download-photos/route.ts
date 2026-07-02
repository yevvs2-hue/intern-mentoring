import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require("archiver") as (format: string, options?: object) => import("archiver").Archiver;
import { PassThrough, Readable } from "stream";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "mentoring" | "senior" | null(전체)

  const store = await readStore();
  const photos = (store.photos ?? []).filter((p) => !type || p.type === type);

  if (photos.length === 0) {
    return NextResponse.json({ error: "다운로드할 사진이 없습니다." }, { status: 404 });
  }

  const pass = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 6 } });

  archive.on("error", (err) => { throw err; });
  archive.pipe(pass);

  for (const photo of photos) {
    try {
      let buffer: ArrayBuffer;
      if (photo.fileUrl.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", photo.fileUrl);
        buffer = (await fs.promises.readFile(filePath)).buffer as ArrayBuffer;
      } else {
        const res = await fetch(photo.fileUrl, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
        });
        if (!res.ok) continue;
        buffer = await res.arrayBuffer();
      }
      const folder = photo.type === "mentoring" ? "멘토링사진" : "선배탐구사진";
      const safeName = `${photo.date}_${photo.internName}_${photo.fileName}`;
      archive.append(Readable.from(Buffer.from(buffer)), { name: `${folder}/${safeName}` });
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

  const label = type === "mentoring" ? "멘토링" : type === "senior" ? "선배탐구" : "전체";
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`사진_${label}.zip`)}`,
    },
  });
}
