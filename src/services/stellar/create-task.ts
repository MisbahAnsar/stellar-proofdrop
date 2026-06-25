import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  rpc,
  scValToNative,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

import { getNetworkConfig } from "@/config/stellar";
import { ContractError } from "@/lib/stellar/errors";

type CreateTaskOnChainParams = {
  publicKey: string;
  rewardStroops: bigint;
  contractId: string;
};

type CreateTaskOnChainResult = {
  taskId: string;
  transactionHash: string;
};

async function pollTransaction(
  server: rpc.Server,
  hash: string,
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  let response = await server.getTransaction(hash);

  while (response.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

export async function createTaskOnChain({
  publicKey,
  rewardStroops,
  contractId,
}: CreateTaskOnChainParams): Promise<CreateTaskOnChainResult> {
  const { networkPassphrase, rpcUrl } = getNetworkConfig();
  const server = new rpc.Server(rpcUrl);

  const account = await server.getAccount(publicKey);
  const contract = new Contract(contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      contract.call(
        "create_task",
        new Address(publicKey).toScVal(),
        nativeToScVal(rewardStroops, { type: "i128" }),
      ),
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(transaction);

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

  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status !== "PENDING") {
    throw new ContractError(
      `Unable to submit transaction: ${sendResult.status}`,
      "TRANSACTION_FAILED",
    );
  }

  const confirmed = await pollTransaction(server, sendResult.hash);
  const returnValue = confirmed.returnValue;

  if (!returnValue) {
    throw new ContractError(
      "Contract did not return a task ID.",
      "TRANSACTION_FAILED",
    );
  }

  const taskId = scValToNative(returnValue).toString();

  return {
    taskId,
    transactionHash: sendResult.hash,
  };
}
