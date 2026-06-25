import type { TaskMetadata } from "@/types/task";

export function isOpenTask(task: TaskMetadata) {
  return !task.status || task.status === "open";
}

export function isCompletedTask(task: TaskMetadata) {
  return task.status === "approved";
}

export function isPendingReview(task: TaskMetadata, creatorAddress?: string) {
  return (
    Boolean(creatorAddress) &&
    task.creator === creatorAddress &&
    task.status === "proof_submitted"
  );
}

export function filterMyTasks(tasks: TaskMetadata[], address?: string) {
  if (!address) {
    return [];
  }

  return tasks.filter((task) => task.creator === address);
}

export function filterOpenTasks(tasks: TaskMetadata[]) {
  return tasks.filter(isOpenTask);
}

export function filterCompletedTasks(tasks: TaskMetadata[]) {
  return tasks.filter(isCompletedTask);
}

export function filterPendingReviews(
  tasks: TaskMetadata[],
  creatorAddress?: string,
) {
  if (!creatorAddress) {
    return [];
  }

  return tasks.filter((task) => isPendingReview(task, creatorAddress));
}
