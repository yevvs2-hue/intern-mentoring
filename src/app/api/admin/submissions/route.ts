import { NextRequest, NextResponse } from "next/server";
import { readStore, mutateStore } from "@/lib/store";

export async function GET() {
  const store = await readStore();

  return NextResponse.json({
    interns: store.interns,
    mentoring: store.mentoring,
    senior: store.senior,
    manual: store.manual,
    photos: store.photos ?? [],
    plan: store.plan ?? [],
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, type } = body as { id: string; type: "mentoring" | "senior" | "manual" };
  if (!id || !type) {
    return NextResponse.json({ error: "id and type are required" }, { status: 400 });
  }
  if (!["mentoring", "senior", "manual"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const found = await mutateStore((store) => {
    const before = store[type].length;
    if (type === "mentoring") {
      store.mentoring = store.mentoring.filter((s) => s.id !== id);
    } else if (type === "senior") {
      store.senior = store.senior.filter((s) => s.id !== id);
    } else {
      store.manual = store.manual.filter((s) => s.id !== id);
    }
    return store[type].length !== before;
  });
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
