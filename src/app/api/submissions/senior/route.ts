import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { SeniorSubmission } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const submission: SeniorSubmission = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...body,
  };

  const store = await readStore();
  store.senior.push(submission);
  await writeStore(store);

  return NextResponse.json({ submission });
}
