import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";
import { ManualSubmission } from "@/types";
import { put } from "@vercel/blob";
import path from "path";

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

  const ext = path.extname(file.name);
  const blobName = `manuals/${crypto.randomUUID()}${ext}`;
  const { url: fileUrl } = await put(blobName, file, { access: "private" });

  const submission: ManualSubmission = {
    id: crypto.randomUUID(),
    employeeId,
    internName,
    department,
    description,
    fileName: file.name,
    fileUrl,
    fileSize: file.size,
    submittedAt: new Date().toISOString(),
  };

  await mutateStore((store) => {
    store.manual.push(submission);
  });

  return NextResponse.json({ submission });
}
