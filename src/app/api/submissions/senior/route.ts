import { NextRequest, NextResponse } from "next/server";
import { mutateStore } from "@/lib/store";
import { SeniorSubmission, PhotoSubmission } from "@/types";
import { put } from "@vercel/blob";
import path from "path";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, employeeId } = body as { id: string; employeeId: string };
  if (!id || !employeeId) {
    return NextResponse.json({ error: "id and employeeId are required" }, { status: 400 });
  }
  const found = await mutateStore((store) => {
    const before = store.senior.length;
    store.senior = store.senior.filter(
      (s) => !(s.id === id && s.employeeId === employeeId)
    );
    return store.senior.length !== before;
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
    const idx = store.senior.findIndex(
      (s) => s.id === id && s.employeeId === employeeId
    );
    if (idx === -1) return null;
    const immutable: (keyof SeniorSubmission)[] = ["id", "submittedAt", "employeeId", "internName"];
    const updated = { ...store.senior[idx] };
    for (const [key, value] of Object.entries(updatedFields)) {
      if (!immutable.includes(key as keyof SeniorSubmission)) {
        (updated as Record<string, string>)[key] = value;
      }
    }
    store.senior[idx] = updated;
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

    await mutateStore((store) => {
      store.senior.push(senior);
      if (!store.photos) store.photos = [];
      store.photos.push(...photos);
    });

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
  await mutateStore((store) => {
    store.senior.push(submission);
  });
  return NextResponse.json({ submission });
}
