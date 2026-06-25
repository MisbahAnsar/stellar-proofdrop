import type { TaskMetadata } from "@/types/task";

const STORAGE_KEY = "proveit:task-metadata";

function readAll(): TaskMetadata[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as TaskMetadata[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(metadata: TaskMetadata[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  } catch {
    // QuotaExceededError or private browsing — fail silently for demo storage.
  }
}

export function saveTaskMetadata(metadata: TaskMetadata) {
  const existing = readAll();
  writeAll([
    metadata,
    ...existing.filter((item) => item.taskId !== metadata.taskId),
  ]);
}

export function getTaskMetadataList(): TaskMetadata[] {
  return readAll().sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function getTaskMetadata(taskId: string): TaskMetadata | undefined {
  return readAll().find((item) => item.taskId === taskId);
}

export function updateTaskMetadata(
  taskId: string,
  patch: Partial<TaskMetadata>,
): TaskMetadata | undefined {
  const existing = readAll();
  const index = existing.findIndex((item) => item.taskId === taskId);
  if (index === -1) {
    return undefined;
  }

  const updated = { ...existing[index], ...patch };
  const next = [...existing];
  next[index] = updated;
  writeAll(next);
  return updated;
}

export function upsertTaskMetadata(
  taskId: string,
  patch: Partial<TaskMetadata> & Pick<TaskMetadata, "title" | "description">,
): TaskMetadata {
  const existing = readAll();
  const index = existing.findIndex((item) => item.taskId === taskId);

  if (index === -1) {
    const created: TaskMetadata = {
      creator: patch.creator ?? "",
      rewardStroops: patch.rewardStroops ?? "0",
      transactionHash: patch.transactionHash ?? "",
      createdAt: patch.createdAt ?? new Date().toISOString(),
      ...patch,
      taskId,
    };
    writeAll([created, ...existing]);
    return created;
  }

  const updated = { ...existing[index], ...patch };
  const next = [...existing];
  next[index] = updated;
  writeAll(next);
  return updated;
}
