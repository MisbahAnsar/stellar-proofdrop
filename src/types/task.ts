export type TaskStatus = "open" | "proof_submitted" | "approved" | "rejected";

export type TaskMetadata = {
  taskId: string;
  title: string;
  description: string;
  deadline?: string;
  creator: string;
  rewardStroops: string;
  transactionHash: string;
  createdAt: string;
  ledger?: number;
  status?: TaskStatus;
  proofHash?: string;
  proofSubmittedBy?: string;
  proofSubmittedAt?: string;
  proofTransactionHash?: string;
};

export type TaskCreatedChainEvent = {
  taskId: string;
  creator: string;
  rewardStroops: string;
  transactionHash: string;
  ledger: number;
};
