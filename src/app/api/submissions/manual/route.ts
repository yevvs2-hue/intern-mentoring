import { NextRequest, NextResponse } from "next/server";
import { mutateStore, isLocal } from "@/lib/store";
import { ManualSubmission } from "@/types";
import { put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, employeeId } = body as { id: string; employeeId: string };
  if (!id || !employeeId) {
    return NextResponse.json({ error: "id and employeeId are required" }, { status: 400 });
  }
  const removed = await mutateStore((store) => {
    const target = store.manual.find((s) => s.id === id && s.employeeId === employeeId);
    store.manual = store.manual.filter((s) => !(s.id === id && s.employeeId === employeeId));
    return target ?? null;
  });
  if (!removed) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }
  if (removed.fileUrl.startsWith("/uploads/")) {
    try { fs.unlinkSync(path.join(process.cwd(), "public", removed.fileUrl)); } catch {}
  } else if (!isLocal) {
    await del(removed.fileUrl).catch(() => {});
  }
  return NextResponse.json({ success: true });
}

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
  const diskName = `${crypto.randomUUID()}${ext}`;

  let fileUrl: string;
  if (isLocal) {
    const dir = path.join(process.cwd(), "public", "uploads", "manuals");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, diskName), Buffer.from(await file.arrayBuffer()));
    fileUrl = `/uploads/manuals/${diskName}`;
  } else {
    ({ url: fileUrl } = await put(`manuals/${diskName}`, file, { access: "private" }));
  }

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
