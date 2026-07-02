import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { name, employeeId } = await req.json();

  if (!name || !employeeId) {
    return NextResponse.json({ error: "이름과 사번을 입력해 주세요." }, { status: 400 });
  }

  const store = await readStore();
  const intern = store.interns.find((i) => i.employeeId === employeeId);

  if (!intern) {
    return NextResponse.json({ error: "등록되지 않은 사번입니다. 담당자에게 문의하세요." }, { status: 403 });
  }

  if (intern.name !== name) {
    return NextResponse.json({ error: "이름 또는 사번이 올바르지 않습니다." }, { status: 403 });
  }

  return NextResponse.json({ intern });
}
