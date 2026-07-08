import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 엑셀 일괄 업로드: { interns: [{name, employeeId, team}] }
  if (Array.isArray(body.interns)) {
    const rows: { name: string; employeeId: string; team?: string }[] = body.interns;
    if (rows.length === 0) {
      return NextResponse.json({ error: "데이터가 없습니다." }, { status: 400 });
    }
    const { added, updated, skipped } = await mutateStore((store) => {
      const byId = new Map(store.interns.map((i) => [i.employeeId, i]));
      let added = 0;
      let updated = 0;
      let skipped = 0;
      for (const row of rows) {
        const name = String(row.name ?? "").trim();
        const employeeId = String(row.employeeId ?? "").trim();
        const team = String(row.team ?? "").trim();
        if (!name || !employeeId) { skipped++; continue; }
        const existing = byId.get(employeeId);
        if (existing) {
          // 이미 등록된 사번이면 이름/팀명을 최신 값으로 갱신 (재업로드로 팀명만 추가하는 경우 지원)
          existing.name = name;
          if (team) existing.team = team;
          updated++;
          continue;
        }
        const intern = { name, employeeId, ...(team ? { team } : {}) };
        store.interns.push(intern);
        byId.set(employeeId, intern);
        added++;
      }
      return { added, updated, skipped };
    });
    return NextResponse.json({ success: true, added, updated, skipped });
  }

  // 단건 추가
  const { name, employeeId, team } = body;
  if (!name || !employeeId) {
    return NextResponse.json({ error: "이름과 사번을 입력하세요." }, { status: 400 });
  }

  const duplicate = await mutateStore((store) => {
    if (store.interns.some((i) => i.employeeId === employeeId)) {
      return true;
    }
    const trimmedTeam = String(team ?? "").trim();
    store.interns.push({ name: name.trim(), employeeId: employeeId.trim(), ...(trimmedTeam ? { team: trimmedTeam } : {}) });
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
