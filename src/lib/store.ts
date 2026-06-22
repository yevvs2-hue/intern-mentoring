import fs from "fs";
import path from "path";
import { SubmissionsStore } from "@/types";

const DATA_PATH = path.join(process.cwd(), "data", "submissions.json");

export async function readStore(): Promise<SubmissionsStore> {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as SubmissionsStore;
  } catch {
    const initial: SubmissionsStore = { interns: [], mentoring: [], senior: [], manual: [], photos: [] };
    await writeStore(initial);
    return initial;
  }
}

export async function writeStore(data: SubmissionsStore): Promise<void> {
  await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
