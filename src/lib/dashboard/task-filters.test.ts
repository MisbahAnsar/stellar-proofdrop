import { describe, expect, it } from "vitest";

import {
  filterCompletedTasks,
  filterMyTasks,
  filterOpenTasks,
  filterPendingReviews,
} from "@/lib/dashboard/task-filters";
import type { TaskMetadata } from "@/types/task";

const task = (overrides: Partial<TaskMetadata>): TaskMetadata => ({
  taskId: "1",
  title: "Task",
  description: "Description",
  creator: "GCREATOR",
  rewardStroops: "10000000",
  transactionHash: "tx",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("dashboard task filters", () => {
  const tasks = [
    task({ taskId: "1", status: "open", creator: "GCREATOR" }),
    task({ taskId: "2", status: "proof_submitted", creator: "GCREATOR" }),
    task({ taskId: "3", status: "approved", creator: "GCREATOR" }),
    task({ taskId: "4", status: "open", creator: "GOTHER" }),
    task({ taskId: "5", status: "approved", creator: "GOTHER" }),
  ];

  it("filters my tasks by creator address", () => {
    expect(filterMyTasks(tasks, "GCREATOR").map((item) => item.taskId)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("filters open tasks", () => {
    expect(filterOpenTasks(tasks).map((item) => item.taskId)).toEqual([
      "1",
      "4",
    ]);
  });

  it("filters completed tasks", () => {
    expect(filterCompletedTasks(tasks).map((item) => item.taskId)).toEqual([
      "3",
      "5",
    ]);
  });

  it("filters pending reviews for creator", () => {
    expect(
      filterPendingReviews(tasks, "GCREATOR").map((item) => item.taskId),
    ).toEqual(["2"]);
  });
});
