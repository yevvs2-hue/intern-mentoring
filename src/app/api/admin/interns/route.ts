import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 엑셀 일괄 업로드: { interns: [{name, employeeId}] }
  if (Array.isArray(body.interns)) {
    const rows: { name: string; employeeId: string }[] = body.interns;
    if (rows.length === 0) {
      return NextResponse.json({ error: "데이터가 없습니다." }, { status: 400 });
    }
    const { added, skipped } = await mutateStore((store) => {
      const existingIds = new Set(store.interns.map((i) => i.employeeId));
      let added = 0;
      let skipped = 0;
      for (const row of rows) {
        const name = String(row.name ?? "").trim();
        const employeeId = String(row.employeeId ?? "").trim();
        if (!name || !employeeId) { skipped++; continue; }
        if (existingIds.has(employeeId)) { skipped++; continue; }
        store.interns.push({ name, employeeId });
        existingIds.add(employeeId);
        added++;
      }
      return { added, skipped };
    });
    return NextResponse.json({ success: true, added, skipped });
  }

  // 단건 추가
  const { name, employeeId } = body;
  if (!name || !employeeId) {
    return NextResponse.json({ error: "이름과 사번을 입력하세요." }, { status: 400 });
  }

  const duplicate = await mutateStore((store) => {
    if (store.interns.some((i) => i.employeeId === employeeId)) {
      return true;
    }
    store.interns.push({ name: name.trim(), employeeId: employeeId.trim() });
    return false;
  });
  if (duplicate) {
    return NextResponse.json({ error: "이미 등록된 사번입니다." }, { status: 409 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { employeeId } = await req.json();
  if (!employeeId) {
    return NextResponse.json({ error: "사번을 입력하세요." }, { status: 400 });
  }

  const found = await mutateStore((store) => {
    const before = store.interns.length;
    store.interns = store.interns.filter((i) => i.employeeId !== employeeId);
    return store.interns.length !== before;
  });
  if (!found) {
    return NextResponse.json({ error: "해당 인턴을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
