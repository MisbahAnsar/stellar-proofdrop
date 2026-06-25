import { describe, expect, it } from "vitest";

import type { TaskMetadata } from "@/types/task";

function filterPendingReviews(tasks: TaskMetadata[], creatorAddress?: string) {
  return tasks.filter(
    (task) =>
      task.creator === creatorAddress && task.status === "proof_submitted",
  );
}

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

describe("filterPendingReviews", () => {
  it("returns only proof_submitted tasks for the creator", () => {
    const tasks = [
      task({ taskId: "1", status: "proof_submitted" }),
      task({ taskId: "2", status: "open", creator: "GCREATOR" }),
      task({ taskId: "3", status: "proof_submitted", creator: "GOTHER" }),
      task({ taskId: "4", status: "approved" }),
    ];

    expect(filterPendingReviews(tasks, "GCREATOR")).toEqual([
      task({ taskId: "1", status: "proof_submitted" }),
    ]);
  });

  it("returns an empty list when no creator address is provided", () => {
    const tasks = [task({ status: "proof_submitted" })];

    expect(filterPendingReviews(tasks)).toEqual([]);
  });
});
