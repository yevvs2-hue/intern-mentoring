import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const store = await readStore();

  return NextResponse.json({
    mentoring: store.mentoring.filter((s) => s.employeeId === employeeId),
    senior: store.senior.filter((s) => s.employeeId === employeeId),
    manual: store.manual.filter((s) => s.employeeId === employeeId),
    photos: (store.photos ?? []).filter((s) => s.employeeId === employeeId),
    plan: (store.plan ?? []).find((s) => s.employeeId === employeeId) ?? null,
  });
}
