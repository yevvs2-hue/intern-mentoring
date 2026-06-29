import { put, get } from "@vercel/blob";
import { SubmissionsStore } from "@/types";

const STORE_PATH = "data/submissions.json";

const INITIAL: SubmissionsStore = { interns: [], mentoring: [], senior: [], manual: [], photos: [] };

export async function readStore(): Promise<SubmissionsStore> {
  try {
    const result = await get(STORE_PATH, { access: "private" });
    if (!result) return { ...INITIAL };
    return await new Response(result.stream).json() as SubmissionsStore;
  } catch {
    return { ...INITIAL };
  }
}

export async function writeStore(data: SubmissionsStore): Promise<void> {
  await put(STORE_PATH, JSON.stringify(data, null, 2), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}
