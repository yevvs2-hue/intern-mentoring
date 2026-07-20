import { NextRequest, NextResponse } from "next/server";
import { mutateStore, isLocal } from "@/lib/store";
import { SeniorSubmission, PhotoSubmission } from "@/types";
import { put } from "@vercel/blob";
import fs from "fs";
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
    // 로컬 개발 등 Blob 직접 업로드가 불가능한 환경을 위한 대체 경로
    const formData = await req.formData();
    const employeeId = formData.get("employeeId") as string;
    const internName = formData.get("internName") as string;
    const seniorName = formData.get("seniorName") as string;
    const seniorDepartment = formData.get("seniorDepartment") as string;
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
      employeeId, internName, seniorName, seniorDepartment, department, date, topic, content, insights,
    };

    const photos: PhotoSubmission[] = [];
    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const diskName = `senior_${crypto.randomUUID()}${ext}`;

      let fileUrl: string;
      if (isLocal) {
        const dir = path.join(process.cwd(), "public", "uploads", "photos");
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, diskName), Buffer.from(await file.arrayBuffer()));
        fileUrl = `/uploads/photos/${diskName}`;
      } else {
        ({ url: fileUrl } = await put(`photos/${diskName}`, file, { access: "private" }));
      }

      photos.push({
        id: crypto.randomUUID(),
        type: "senior",
        submissionId: senior.id,
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

  // 브라우저에서 Blob으로 직접 업로드한 뒤 메타데이터만 저장 (서버리스 함수 요청 크기 제한 우회)
  const body = await req.json();
  const { photos: uploadedPhotos, ...fields } = body as Omit<SeniorSubmission, "id" | "submittedAt"> & {
    photos?: { fileUrl: string; fileName: string; fileSize: number }[];
  };
  if (!fields.employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const senior: SeniorSubmission = {
    id: crypto.randomUUID(),
    submittedAt: now,
    ...fields,
  };
  const photos: PhotoSubmission[] = (uploadedPhotos ?? []).map((p) => ({
    id: crypto.randomUUID(),
    type: "senior",
    submissionId: senior.id,
    employeeId: senior.employeeId,
    internName: senior.internName,
    department: senior.department,
    date: senior.date,
    caption: "",
    fileName: p.fileName,
    fileUrl: p.fileUrl,
    fileSize: p.fileSize,
    submittedAt: now,
  }));
  await mutateStore((store) => {
    store.senior.push(senior);
    if (!store.photos) store.photos = [];
    store.photos.push(...photos);
  });
  return NextResponse.json({ submission: senior, photos });
}
