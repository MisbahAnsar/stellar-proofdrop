import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import { getNetworkConfig } from "@/config/stellar";
import { hexToBytes } from "@/lib/proof/hash";
import { parseProofSubmittedEvents } from "@/services/stellar/events";
import {
  getContractEvents,
  signAndSubmitTransaction,
} from "@/services/stellar/transaction";
import type { TransactionProgressHandler } from "@/services/stellar/transaction-types";
import type { ProofSubmittedChainEvent } from "@/types/proof";

type SubmitProofOnChainParams = {
  publicKey: string;
  taskId: string;
  proofHashHex: string;
  contractId: string;
  onProgress?: TransactionProgressHandler;
};

export type SubmitProofOnChainResult = {
  taskId: string;
  proofHashHex: string;
  transactionHash: string;
  ledger: number;
  events: ProofSubmittedChainEvent[];
};

export async function submitProofOnChain({
  publicKey,
  taskId,
  proofHashHex,
  contractId,
  onProgress,
}: SubmitProofOnChainParams): Promise<SubmitProofOnChainResult> {
  const { networkPassphrase } = getNetworkConfig();
  const contract = new Contract(contractId);
  const hashBytes = hexToBytes(proofHashHex);

  if (hashBytes.length !== 32) {
    throw new Error("Proof hash must be 32 bytes.");
  }

  const confirmed = await signAndSubmitTransaction({
    publicKey,
    onProgress,
    build: (account) =>
      new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      }).addOperation(
        contract.call(
          "submit_proof",
          new Address(publicKey).toScVal(),
          nativeToScVal(BigInt(taskId), { type: "u64" }),
          nativeToScVal(Buffer.from(hashBytes), { type: "bytes" }),
        ),
      ),
  });

  const events = parseProofSubmittedEvents(
    getContractEvents(confirmed),
    confirmed.hash,
    confirmed.ledger,
  );

  return {
    taskId,
    proofHashHex,
    transactionHash: confirmed.hash,
    ledger: confirmed.ledger,
    events,
  };
}
