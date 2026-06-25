import type { ActivityEntry } from "@/types/activity";

const STORAGE_KEY = "proofdrop:activity";
const MAX_ENTRIES = 50;

function readAll(): ActivityEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ActivityEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ActivityEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function appendActivity(entry: ActivityEntry) {
  const existing = readAll();
  if (existing.some((item) => item.id === entry.id)) {
    return;
  }

  writeAll([entry, ...existing].slice(0, MAX_ENTRIES));
}

export function getRecentActivity(limit = MAX_ENTRIES): ActivityEntry[] {
  return readAll()
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    )
    .slice(0, limit);
}
