import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { name, employeeId } = await req.json();
  if (!name || !employeeId) {
    return NextResponse.json({ error: "이름과 사번을 입력하세요." }, { status: 400 });
  }

  const store = await readStore();
  if (store.interns.some((i) => i.employeeId === employeeId)) {
    return NextResponse.json({ error: "이미 등록된 사번입니다." }, { status: 409 });
  }

  store.interns.push({ name: name.trim(), employeeId: employeeId.trim() });
  await writeStore(store);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { employeeId } = await req.json();
  if (!employeeId) {
    return NextResponse.json({ error: "사번을 입력하세요." }, { status: 400 });
  }

  const store = await readStore();
  const before = store.interns.length;
  store.interns = store.interns.filter((i) => i.employeeId !== employeeId);
  if (store.interns.length === before) {
    return NextResponse.json({ error: "해당 인턴을 찾을 수 없습니다." }, { status: 404 });
  }

  await writeStore(store);
  return NextResponse.json({ success: true });
}
