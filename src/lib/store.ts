import { put, get, del } from "@vercel/blob";
import { SubmissionsStore } from "@/types";
import fs from "fs";
import path from "path";

const STORE_PATH = "data/submissions.json";
const LOCK_PATH = "data/submissions.lock";
const LOCK_TTL_MS = 15_000;
const LOCK_ACQUIRE_TIMEOUT_MS = 10_000;

const INITIAL: SubmissionsStore = { interns: [], mentoring: [], senior: [], manual: [], photos: [], plan: [] };

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "submissions.local.json");
export const isLocal = !process.env.BLOB_READ_WRITE_TOKEN;

function readLocalStore(): SubmissionsStore {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_STORE_PATH, "utf-8"));
    }
  } catch {}
  return { ...INITIAL };
}

function writeLocalStore(data: SubmissionsStore): void {
  fs.mkdirSync(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function readStore(): Promise<SubmissionsStore> {
  if (isLocal) return readLocalStore();
  try {
    const result = await get(STORE_PATH, { access: "private", useCache: false });
    if (!result) return { ...INITIAL };
    return await new Response(result.stream).json() as SubmissionsStore;
  } catch {
    return { ...INITIAL };
  }
}

export async function writeStore(data: SubmissionsStore): Promise<void> {
  if (isLocal) { writeLocalStore(data); return; }
  await put(STORE_PATH, JSON.stringify(data, null, 2), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

async function acquireLock(): Promise<void> {
  if (isLocal) return;
  const deadline = Date.now() + LOCK_ACQUIRE_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      await put(LOCK_PATH, String(Date.now()), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "text/plain",
      });
      return;
    } catch {
      try {
        const existing = await get(LOCK_PATH, { access: "private", useCache: false });
        const lockedAt = existing ? Number(await new Response(existing.stream).text()) : NaN;
        if (!existing || Number.isNaN(lockedAt) || Date.now() - lockedAt > LOCK_TTL_MS) {
          await del(LOCK_PATH).catch(() => {});
          continue;
        }
      } catch {
        // couldn't inspect lock; fall through to backoff and retry
      }
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 150));
    }
  }
  throw new Error("제출물 저장소 잠금을 획득하지 못했습니다. 잠시 후 다시 시도해주세요.");
}

async function releaseLock(): Promise<void> {
  if (isLocal) return;
  await del(LOCK_PATH).catch(() => {});
}

// 동시 요청으로 인한 read-modify-write 유실을 막기 위해 락을 잡고 mutator를 실행한다.
export async function mutateStore<T>(
  mutator: (store: SubmissionsStore) => T | Promise<T>
): Promise<T> {
  await acquireLock();
  try {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  } finally {
    await releaseLock();
  }
}
