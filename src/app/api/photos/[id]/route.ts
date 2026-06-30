import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const photo = (store.photos ?? []).find((p) => p.id === id);

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
