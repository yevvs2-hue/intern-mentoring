import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { PhotoSubmission } from "@/types";
import { put } from "@vercel/blob";
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
  const blobName = `photos/${type}_${crypto.randomUUID()}${ext}`;
  const { url: fileUrl } = await put(blobName, file, { access: "public" });

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

  const store = await readStore();
  if (!store.photos) store.photos = [];
  store.photos.push(submission);
  await writeStore(store);

  return NextResponse.json({ submission });
}
