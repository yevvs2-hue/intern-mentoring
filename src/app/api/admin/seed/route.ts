import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, Intern } from "@/types";

export async function POST(req: NextRequest) {
  const { interns, mentoring, senior, manual, clearAll } = await req.json() as {
    interns: Intern[];
    mentoring: Omit<MentoringSubmission, "id" | "submittedAt">[];
    senior: Omit<SeniorSubmission, "id" | "submittedAt">[];
    manual?: Omit<ManualSubmission, "id" | "submittedAt">[];
    clearAll?: boolean;
  };

  const counts = await mutateStore((store) => {
    store.interns = interns;

    if (clearAll) {
      store.mentoring = [];
      store.senior = [];
      store.manual = [];
      store.photos = [];
    } else {
      const sampleIds = new Set(interns.map((i) => i.employeeId));
      store.mentoring = store.mentoring.filter((s) => !sampleIds.has(s.employeeId));
      store.senior = store.senior.filter((s) => !sampleIds.has(s.employeeId));
      store.manual = store.manual.filter((s) => !sampleIds.has(s.employeeId));
    }

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

    return {
      interns: store.interns.length,
      mentoring: store.mentoring.length,
      senior: store.senior.length,
      manual: store.manual.length,
    };
  });

  return NextResponse.json(counts);
}
