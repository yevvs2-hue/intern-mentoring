import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require("archiver") as (format: string, options?: object) => import("archiver").Archiver;
import fs from "fs";
import path from "path";
import { PassThrough } from "stream";

export async function GET() {
  const store = await readStore();
  const manuals = store.manual ?? [];

  if (manuals.length === 0) {
    return NextResponse.json({ error: "다운로드할 발표 자료가 없습니다." }, { status: 404 });
  }

  const pass = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 6 } });

  archive.on("error", (err) => { throw err; });
  archive.pipe(pass);

  let added = 0;
  for (const manual of manuals) {
    if (!manual.fileUrl) continue;
    const safeName = `${manual.internName}_${manual.fileName}`;

    // 구버전: 로컬 파일시스템에 저장된 자료 (/uploads/xxx)
    if (manual.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", manual.fileUrl);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: safeName });
        added++;
      }
      continue;
    }

    // 신버전: Vercel Blob private URL
    const res = await fetch(manual.fileUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      archive.append(buffer, { name: safeName });
      added++;
    }
  }

  archive.finalize();

  if (added === 0) {
    return NextResponse.json({ error: "다운로드 가능한 파일이 없습니다." }, { status: 404 });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of pass) {
    chunks.push(chunk as Buffer);
  }
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent("발표자료_전체.zip")}`,
    },
  });
}
