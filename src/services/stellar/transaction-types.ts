export type TransactionPhase =
  | "preparing"
  | "signing"
  | "submitting"
  | "confirming";

export type TransactionProgress = {
  phase: TransactionPhase;
  message: string;
};

export const TRANSACTION_MESSAGES: Record<TransactionPhase, string> = {
  preparing: "Preparing transaction…",
  signing: "Waiting for wallet signature…",
  submitting: "Submitting to network…",
  confirming: "Confirming on-chain…",
};

export type TransactionProgressHandler = (
  progress: TransactionProgress,
) => void;
