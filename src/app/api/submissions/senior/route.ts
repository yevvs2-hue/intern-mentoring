import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { SeniorSubmission, PhotoSubmission } from "@/types";
import { put } from "@vercel/blob";
import path from "path";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const employeeId = formData.get("employeeId") as string;
    const internName = formData.get("internName") as string;
    const seniorName = formData.get("seniorName") as string;
    const department = formData.get("department") as string;
    const date = formData.get("date") as string;
    const topic = formData.get("topic") as string;
    const content = formData.get("content") as string;
    const insights = formData.get("insights") as string;
    const files = formData.getAll("photos") as File[];

    const now = new Date().toISOString();
    const senior: SeniorSubmission = {
      id: crypto.randomUUID(),
      submittedAt: now,
      employeeId, internName, seniorName, department, date, topic, content, insights,
    };

    const photos: PhotoSubmission[] = [];
    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const blobName = `photos/senior_${crypto.randomUUID()}${ext}`;
      const { url: fileUrl } = await put(blobName, file, { access: "private" });
      photos.push({
        id: crypto.randomUUID(),
        type: "senior",
        employeeId, internName, department, date,
        caption: "",
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        submittedAt: now,
      });
    }

    const store = await readStore();
    store.senior.push(senior);
    if (!store.photos) store.photos = [];
    store.photos.push(...photos);
    await writeStore(store);

    return NextResponse.json({ submission: senior, photos });
  }

  // 기존 JSON 방식 (하위 호환)
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
