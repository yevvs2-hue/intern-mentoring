import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const manual = store.manual.find((m) => m.id === id);

  if (!manual) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 구버전: 로컬 파일시스템에 저장된 자료 (/uploads/manuals/xxx)
  if (manual.fileUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", manual.fileUrl);
    try {
      const buffer = await fs.promises.readFile(filePath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(manual.fileName)}`,
        },
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // 신버전: Vercel Blob private URL
  const res = await fetch(manual.fileUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(manual.fileName)}`,
    },
  });
}
