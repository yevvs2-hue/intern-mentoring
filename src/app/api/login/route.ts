import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { name, employeeId } = await req.json();

  if (!name || !employeeId) {
    return NextResponse.json({ error: "이름과 사번을 입력해 주세요." }, { status: 400 });
  }

  const store = await readStore();
  const existing = store.interns.find((i) => i.employeeId === employeeId);

  if (!existing) {
    store.interns.push({ name, employeeId });
    await writeStore(store);
  }

  const intern = existing ?? { name, employeeId };
  return NextResponse.json({ intern });
}
