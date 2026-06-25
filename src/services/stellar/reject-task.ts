import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import { getNetworkConfig } from "@/config/stellar";
import { parseTaskRejectedEvents } from "@/services/stellar/events";
import {
  getContractEvents,
  signAndSubmitTransaction,
} from "@/services/stellar/transaction";
import type { TransactionProgressHandler } from "@/services/stellar/transaction-types";
import type { TaskRejectedChainEvent } from "@/types/task";

type RejectTaskOnChainParams = {
  publicKey: string;
  taskId: string;
  contractId: string;
  onProgress?: TransactionProgressHandler;
};

export type RejectTaskOnChainResult = {
  taskId: string;
  transactionHash: string;
  ledger: number;
  events: TaskRejectedChainEvent[];
};

export async function rejectTaskOnChain({
  publicKey,
  taskId,
  contractId,
  onProgress,
}: RejectTaskOnChainParams): Promise<RejectTaskOnChainResult> {
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
          "reject_task",
          new Address(publicKey).toScVal(),
          nativeToScVal(BigInt(taskId), { type: "u64" }),
        ),
      ),
  });

  const events = parseTaskRejectedEvents(
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
