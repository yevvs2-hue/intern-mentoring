import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, Intern } from "@/types";

export async function POST(req: NextRequest) {
  const { interns, mentoring, senior, manual } = await req.json() as {
    interns: Intern[];
    mentoring: Omit<MentoringSubmission, "id" | "submittedAt">[];
    senior: Omit<SeniorSubmission, "id" | "submittedAt">[];
    manual?: Omit<ManualSubmission, "id" | "submittedAt">[];
  };

  const store = await readStore();

  store.interns = interns;

  const sampleIds = new Set(interns.map((i) => i.employeeId));
  store.mentoring = store.mentoring.filter((s) => !sampleIds.has(s.employeeId));
  store.senior = store.senior.filter((s) => !sampleIds.has(s.employeeId));
  store.manual = store.manual.filter((s) => !sampleIds.has(s.employeeId));

  const now = new Date().toISOString();
  for (const m of mentoring) {
    store.mentoring.push({ ...m, id: crypto.randomUUID(), submittedAt: now });
  }
  for (const s of senior) {
    store.senior.push({ ...s, id: crypto.randomUUID(), submittedAt: now });
  }
  for (const m of (manual ?? [])) {
    store.manual.push({ ...m, id: crypto.randomUUID(), submittedAt: now });
  }

  await writeStore(store);
  return NextResponse.json({
    interns: store.interns.length,
    mentoring: store.mentoring.length,
    senior: store.senior.length,
    manual: store.manual.length,
  });
}
