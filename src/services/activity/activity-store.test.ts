import { afterEach, describe, expect, it } from "vitest";

import {
  appendActivity,
  getRecentActivity,
} from "@/services/activity/activity-store";
import type { ActivityEntry } from "@/types/activity";

const STORAGE_KEY = "proofdrop:activity";

const sampleEntry = (id: string): ActivityEntry => ({
  id,
  type: "task_created",
  taskId: "1",
  title: "Task",
  message: "Task created",
  timestamp: "2026-01-01T00:00:00.000Z",
});

afterEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("activity-store", () => {
  it("appends and retrieves recent activity", () => {
    appendActivity(sampleEntry("a"));
    appendActivity(sampleEntry("b"));

    expect(getRecentActivity()).toHaveLength(2);
  });

  it("deduplicates activity by id", () => {
    appendActivity(sampleEntry("a"));
    appendActivity(sampleEntry("a"));

    expect(getRecentActivity()).toHaveLength(1);
  });
});
