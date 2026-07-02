import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";
import { PhotoSubmission } from "@/types";

export async function POST(req: NextRequest) {
  const { photos } = await req.json() as {
    photos: Omit<PhotoSubmission, "id" | "submittedAt">[];
  };

  const count = await mutateStore((store) => {
    if (!store.photos) store.photos = [];
    const now = new Date().toISOString();
    for (const p of photos) {
      store.photos.push({ ...p, id: crypto.randomUUID(), submittedAt: now });
    }
    return store.photos.length;
  });

  return NextResponse.json({ photos: count });
}
