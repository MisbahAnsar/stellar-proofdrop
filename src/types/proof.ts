export type StoredProof = {
  taskId: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  sha256: string;
  submittedBy: string;
  submittedAt: string;
};

export type ProofVerification = {
  storedHash: string;
  onChainHash: string | null;
  matches: boolean;
};

export type ProofSubmittedChainEvent = {
  taskId: string;
  worker: string;
  proofHashHex: string;
  transactionHash: string;
  ledger: number;
};
