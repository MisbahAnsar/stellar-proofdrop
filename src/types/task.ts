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
};

export type TaskCreatedChainEvent = {
  taskId: string;
  creator: string;
  rewardStroops: string;
  transactionHash: string;
  ledger: number;
};
