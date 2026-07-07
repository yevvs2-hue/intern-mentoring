import { NextRequest, NextResponse } from "next/server";
import { mutateStore, isLocal } from "@/lib/store";
import { PhotoSubmission } from "@/types";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const type = formData.get("type") as "mentoring" | "senior";
  const employeeId = formData.get("employeeId") as string;
  const internName = formData.get("internName") as string;
  const department = formData.get("department") as string;
  const date = formData.get("date") as string;
  const caption = (formData.get("caption") as string) ?? "";
  const file = formData.get("file") as File | null;

  if (!type || !employeeId || !internName || !department || !date || !file) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"];
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "이미지 파일(JPG, PNG, GIF, WEBP)만 업로드할 수 있습니다." }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const diskName = `${type}_${crypto.randomUUID()}${ext}`;

  let fileUrl: string;
  if (isLocal) {
    const dir = path.join(process.cwd(), "public", "uploads", "photos");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, diskName), Buffer.from(await file.arrayBuffer()));
    fileUrl = `/uploads/photos/${diskName}`;
  } else {
    ({ url: fileUrl } = await put(`photos/${diskName}`, file, { access: "private" }));
  }

  const submission: PhotoSubmission = {
    id: crypto.randomUUID(),
    type,
    employeeId,
    internName,
    department,
    date,
    caption,
    fileName: file.name,
    fileUrl,
    fileSize: file.size,
    submittedAt: new Date().toISOString(),
  };

  await mutateStore((store) => {
    if (!store.photos) store.photos = [];
    store.photos.push(submission);
  });

  return NextResponse.json({ submission });
}
