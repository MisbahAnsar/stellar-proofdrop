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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
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
