import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import { getNetworkConfig } from "@/config/stellar";
import { parseTaskApprovedEvents } from "@/services/stellar/events";
import {
  getContractEvents,
  signAndSubmitTransaction,
} from "@/services/stellar/transaction";
import type { TransactionProgressHandler } from "@/services/stellar/transaction-types";
import type { TaskApprovedChainEvent } from "@/types/task";

type ApproveTaskOnChainParams = {
  publicKey: string;
  taskId: string;
  contractId: string;
  onProgress?: TransactionProgressHandler;
};

export type ApproveTaskOnChainResult = {
  taskId: string;
  transactionHash: string;
  ledger: number;
  events: TaskApprovedChainEvent[];
};

export async function approveTaskOnChain({
  publicKey,
  taskId,
  contractId,
  onProgress,
}: ApproveTaskOnChainParams): Promise<ApproveTaskOnChainResult> {
  const { networkPassphrase } = getNetworkConfig();
  const contract = new Contract(contractId);

  const confirmed = await signAndSubmitTransaction({
    publicKey,
    onProgress,
    build: (account) =>
      new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      }).addOperation(
        contract.call(
          "approve_task",
          new Address(publicKey).toScVal(),
          nativeToScVal(BigInt(taskId), { type: "u64" }),
        ),
      ),
  });

  const events = parseTaskApprovedEvents(
    getContractEvents(confirmed),
    confirmed.hash,
    confirmed.ledger,
  );

  return {
    taskId,
    transactionHash: confirmed.hash,
    ledger: confirmed.ledger,
    events,
  };
}
