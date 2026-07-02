import { NextRequest, NextResponse } from "next/server";
import { readStore, mutateStore } from "@/lib/store";
import { PlanSubmission } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  if (!employeeId) return NextResponse.json({ error: "employeeId is required" }, { status: 400 });

  const store = await readStore();
  const plan = (store.plan ?? []).find((p) => p.employeeId === employeeId) ?? null;
  return NextResponse.json({ plan });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Omit<PlanSubmission, "id" | "submittedAt">;
  const { employeeId, internName, department, mentorName, mentoringPlan, seniorPlan, goal } = body;

  if (!employeeId || !internName || !department || !mentorName || !mentoringPlan || !seniorPlan || !goal) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const submission: PlanSubmission = {
    id: crypto.randomUUID(),
    employeeId,
    internName,
    department,
    mentorName,
    mentoringPlan,
    seniorPlan,
    goal,
    submittedAt: new Date().toISOString(),
  };

  await mutateStore((store) => {
    if (!store.plan) store.plan = [];
    store.plan = store.plan.filter((p) => p.employeeId !== employeeId);
    store.plan.push(submission);
    return true;
  });

  return NextResponse.json({ plan: submission });
}
