import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const photo = (store.photos ?? []).find((p) => p.id === id);

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 구버전: 로컬 파일시스템에 저장된 사진 (/uploads/photos/xxx.jpg)
  if (photo.fileUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", photo.fileUrl);
    try {
      const buffer = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : ext === ".webp" ? "image/webp" : "image/jpeg";
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // 신버전: Vercel Blob private URL
  const res = await fetch(photo.fileUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to fetch photo" }, { status: 502 });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "image/jpeg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
