import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import { getNetworkConfig } from "@/config/stellar";
import { ContractError } from "@/lib/stellar/errors";
import { parseTaskCreatedEvents } from "@/services/stellar/events";
import {
  getContractEvents,
  signAndSubmitTransaction,
} from "@/services/stellar/transaction";
import type { TransactionProgressHandler } from "@/services/stellar/transaction-types";
import type { TaskCreatedChainEvent } from "@/types/task";

type CreateTaskOnChainParams = {
  publicKey: string;
  rewardStroops: bigint;
  contractId: string;
  onProgress?: TransactionProgressHandler;
};

export type CreateTaskOnChainResult = {
  taskId: string;
  transactionHash: string;
  ledger: number;
  events: TaskCreatedChainEvent[];
};

export async function createTaskOnChain({
  publicKey,
  rewardStroops,
  contractId,
  onProgress,
}: CreateTaskOnChainParams): Promise<CreateTaskOnChainResult> {
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
          "create_task",
          new Address(publicKey).toScVal(),
          nativeToScVal(rewardStroops, { type: "i128" }),
        ),
      ),
  });

  const returnValue = confirmed.returnValue;
  if (!returnValue) {
    throw new ContractError(
      "Contract did not return a task ID.",
      "TRANSACTION_FAILED",
    );
  }

  const taskId = scValToNative(returnValue).toString();
  const contractEvents = getContractEvents(confirmed);
  const events = parseTaskCreatedEvents(
    contractEvents,
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
