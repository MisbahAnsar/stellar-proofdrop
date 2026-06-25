import type { ActivityEntry } from "@/types/activity";
import type { TaskMetadata } from "@/types/task";

export function activityId(
  type: ActivityEntry["type"],
  taskId: string,
  transactionHash?: string,
) {
  return `${type}:${taskId}:${transactionHash ?? "local"}`;
}

export function activityFromCreatedTask(task: TaskMetadata): ActivityEntry {
  return {
    id: activityId("task_created", task.taskId, task.transactionHash),
    type: "task_created",
    taskId: task.taskId,
    title: task.title,
    message: `Task "${task.title}" created`,
    timestamp: task.createdAt,
    transactionHash: task.transactionHash,
    ledger: task.ledger,
  };
}

export function activityFromUpdatedTask(
  task: TaskMetadata,
): ActivityEntry | null {
  if (task.status === "proof_submitted" && task.proofSubmittedAt) {
    return {
      id: activityId("proof_submitted", task.taskId, task.proofTransactionHash),
      type: "proof_submitted",
      taskId: task.taskId,
      title: task.title,
      message: `Proof submitted for "${task.title}"`,
      timestamp: task.proofSubmittedAt,
      transactionHash: task.proofTransactionHash,
      ledger: task.ledger,
    };
  }

  if (task.status === "approved" && task.reviewedAt) {
    return {
      id: activityId("task_approved", task.taskId, task.reviewTransactionHash),
      type: "task_approved",
      taskId: task.taskId,
      title: task.title,
      message: `Task "${task.title}" approved`,
      timestamp: task.reviewedAt,
      transactionHash: task.reviewTransactionHash,
      ledger: task.ledger,
    };
  }

  if (task.reviewAction === "rejected" && task.reviewedAt) {
    return {
      id: activityId("task_rejected", task.taskId, task.reviewTransactionHash),
      type: "task_rejected",
      taskId: task.taskId,
      title: task.title,
      message: `Proof rejected for "${task.title}"`,
      timestamp: task.reviewedAt,
      transactionHash: task.reviewTransactionHash,
      ledger: task.ledger,
    };
  }

  return null;
}

export function activityFromChainEvent(event: {
  type: ActivityEntry["type"];
  taskId: string;
  title?: string;
  message: string;
  timestamp: string;
  transactionHash: string;
  ledger: number;
}): ActivityEntry {
  return {
    id: activityId(event.type, event.taskId, event.transactionHash),
    type: event.type,
    taskId: event.taskId,
    title: event.title,
    message: event.message,
    timestamp: event.timestamp,
    transactionHash: event.transactionHash,
    ledger: event.ledger,
  };
}
