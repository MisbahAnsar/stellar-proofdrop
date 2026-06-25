export type ActivityType =
  | "task_created"
  | "proof_submitted"
  | "task_approved"
  | "task_rejected";

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  taskId: string;
  title?: string;
  message: string;
  timestamp: string;
  transactionHash?: string;
  ledger?: number;
};
