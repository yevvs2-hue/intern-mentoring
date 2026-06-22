import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET() {
  const store = await readStore();

  return NextResponse.json({
    interns: store.interns,
    mentoring: store.mentoring,
    senior: store.senior,
    manual: store.manual,
    photos: store.photos ?? [],
  });
}
