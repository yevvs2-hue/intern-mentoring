import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { PhotoSubmission } from "@/types";

export async function POST(req: NextRequest) {
  const { photos } = await req.json() as {
    photos: Omit<PhotoSubmission, "id" | "submittedAt">[];
  };

  const store = await readStore();
  if (!store.photos) store.photos = [];

  const now = new Date().toISOString();
  for (const p of photos) {
    store.photos.push({ ...p, id: crypto.randomUUID(), submittedAt: now });
  }

  await writeStore(store);
  return NextResponse.json({ photos: store.photos.length });
}
