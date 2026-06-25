import { rpc, TransactionBuilder, type xdr } from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

import { getNetworkConfig } from "@/config/stellar";
import { ContractError } from "@/lib/stellar/errors";
import { getRpcServer } from "@/services/stellar/rpc";
import {
  TRANSACTION_MESSAGES,
  type TransactionProgressHandler,
} from "@/services/stellar/transaction-types";

type SignAndSubmitParams = {
  publicKey: string;
  build: (
    account: Awaited<ReturnType<rpc.Server["getAccount"]>>,
  ) => TransactionBuilder;
  onProgress?: TransactionProgressHandler;
};

export type ConfirmedTransaction = rpc.Api.GetSuccessfulTransactionResponse & {
  hash: string;
};

const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 1000;

async function pollTransaction(
  server: rpc.Server,
  hash: string,
  onProgress?: TransactionProgressHandler,
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  onProgress?.({
    phase: "confirming",
    message: TRANSACTION_MESSAGES.confirming,
  });

  let response = await server.getTransaction(hash);
  let attempts = 0;

  while (response.status === "NOT_FOUND") {
    if (attempts >= MAX_POLL_ATTEMPTS) {
      throw new ContractError(
        "Transaction confirmation timed out. Check the explorer and retry.",
        "TRANSACTION_FAILED",
      );
    }

    attempts += 1;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    response = await server.getTransaction(hash);
  }

  if (response.status !== "SUCCESS") {
    throw new ContractError(
      `Transaction failed with status: ${response.status}`,
      "TRANSACTION_FAILED",
    );
  }

  return response;
}

export async function signAndSubmitTransaction({
  publicKey,
  build,
  onProgress,
}: SignAndSubmitParams): Promise<ConfirmedTransaction> {
  const { networkPassphrase } = getNetworkConfig();
  const server = getRpcServer();

  onProgress?.({
    phase: "preparing",
    message: TRANSACTION_MESSAGES.preparing,
  });

  const account = await server.getAccount(publicKey);
  const transaction = build(account).setTimeout(30).build();
  const prepared = await server.prepareTransaction(transaction);

  onProgress?.({
    phase: "signing",
    message: TRANSACTION_MESSAGES.signing,
  });

  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase,
    address: publicKey,
  });

  if (signed.error) {
    throw new ContractError(signed.error.message, "TRANSACTION_FAILED");
  }

  const signedTx = TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    networkPassphrase,
  );

  onProgress?.({
    phase: "submitting",
    message: TRANSACTION_MESSAGES.submitting,
  });

  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status !== "PENDING") {
    throw new ContractError(
      `Unable to submit transaction: ${sendResult.status}`,
      "TRANSACTION_FAILED",
    );
  }

  const confirmed = await pollTransaction(server, sendResult.hash, onProgress);

  return {
    ...confirmed,
    hash: sendResult.hash,
  };
}

export function getContractEvents(
  confirmed: ConfirmedTransaction,
): xdr.ContractEvent[] {
  return confirmed.events.contractEventsXdr.flat();
}
