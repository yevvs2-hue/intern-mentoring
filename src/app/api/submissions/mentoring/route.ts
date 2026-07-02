import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";
import { MentoringSubmission, PhotoSubmission } from "@/types";
import { put } from "@vercel/blob";
import path from "path";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, employeeId } = body as { id: string; employeeId: string };
  if (!id || !employeeId) {
    return NextResponse.json({ error: "id and employeeId are required" }, { status: 400 });
  }
  const found = await mutateStore((store) => {
    const before = store.mentoring.length;
    store.mentoring = store.mentoring.filter(
      (s) => !(s.id === id && s.employeeId === employeeId)
    );
    return store.mentoring.length !== before;
  });
  if (!found) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, employeeId, ...updatedFields } = body as {
    id: string;
    employeeId: string;
    [key: string]: string;
  };
  if (!id || !employeeId) {
    return NextResponse.json({ error: "id and employeeId are required" }, { status: 400 });
  }
  const updated = await mutateStore((store) => {
    const idx = store.mentoring.findIndex(
      (s) => s.id === id && s.employeeId === employeeId
    );
    if (idx === -1) return null;
    const immutable: (keyof MentoringSubmission)[] = ["id", "submittedAt", "employeeId", "internName"];
    const updated = { ...store.mentoring[idx] };
    for (const [key, value] of Object.entries(updatedFields)) {
      if (!immutable.includes(key as keyof MentoringSubmission)) {
        (updated as Record<string, string>)[key] = value;
      }
    }
    store.mentoring[idx] = updated;
    return updated;
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }
  return NextResponse.json({ submission: updated });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    // 사진 포함 통합 제출
    const formData = await req.formData();
    const employeeId = formData.get("employeeId") as string;
    const internName = formData.get("internName") as string;
    const mentorName = formData.get("mentorName") as string;
    const department = formData.get("department") as string;
    const date = formData.get("date") as string;
    const duration = formData.get("duration") as string;
    const content = formData.get("content") as string;
    const learned = formData.get("learned") as string;
    const nextPlan = formData.get("nextPlan") as string;
    const files = formData.getAll("photos") as File[];

    const now = new Date().toISOString();
    const mentoring: MentoringSubmission = {
      id: crypto.randomUUID(),
      submittedAt: now,
      employeeId, internName, mentorName, department, date, duration, content, learned, nextPlan,
    };

    const photos: PhotoSubmission[] = [];
    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const blobName = `photos/mentoring_${crypto.randomUUID()}${ext}`;
      const { url: fileUrl } = await put(blobName, file, { access: "private" });
      photos.push({
        id: crypto.randomUUID(),
        type: "mentoring",
        employeeId, internName, department, date,
        caption: "",
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        submittedAt: now,
      });
    }

    await mutateStore((store) => {
      store.mentoring.push(mentoring);
      if (!store.photos) store.photos = [];
      store.photos.push(...photos);
    });

    return NextResponse.json({ submission: mentoring, photos });
  }

  // 기존 JSON 방식 (하위 호환)
  const body = await req.json();
  if (!body.employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }
  const submission: MentoringSubmission = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...body,
  };
  await mutateStore((store) => {
    store.mentoring.push(submission);
  });
  return NextResponse.json({ submission });
}
