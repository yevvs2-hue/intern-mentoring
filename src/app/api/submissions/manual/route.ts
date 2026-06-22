import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { ManualSubmission } from "@/types";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const employeeId = formData.get("employeeId") as string;
  const internName = formData.get("internName") as string;
  const department = formData.get("department") as string;
  const description = (formData.get("description") as string) ?? "";
  const file = formData.get("file") as File | null;

  if (!employeeId || !internName || !department || !file) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const ALLOWED = [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/pdf",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "PPT, PDF, 동영상 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const savedName = `${crypto.randomUUID()}${ext}`;
  const savedPath = path.join(UPLOAD_DIR, savedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(savedPath, buffer);

  const submission: ManualSubmission = {
    id: crypto.randomUUID(),
    employeeId,
    internName,
    department,
    description,
    fileName: file.name,
    fileUrl: `/uploads/${savedName}`,
    fileSize: file.size,
    submittedAt: new Date().toISOString(),
  };

  const store = await readStore();
  store.manual.push(submission);
  await writeStore(store);

  return NextResponse.json({ submission });
}
