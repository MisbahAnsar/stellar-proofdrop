"use client";

import { useMutation } from "@tanstack/react-query";

import { getProveItContractId } from "@/config/stellar";
import { xlmToStroops } from "@/lib/stellar/amount";
import { ContractError, getErrorMessage } from "@/lib/stellar/errors";
import type { CreateTaskFormValues } from "@/features/tasks/schemas/create-task";
import { createTaskOnChain } from "@/services/stellar/create-task";
import { saveTaskMetadata } from "@/services/tasks/metadata-store";

type CreateTaskInput = CreateTaskFormValues & {
  creator: string;
};

export function useCreateTask() {
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const contractId = getProveItContractId();
      if (!contractId) {
        throw new ContractError(
          "ProveIt contract ID is not configured. Set NEXT_PUBLIC_PROVEIT_CONTRACT_ID in your environment.",
          "NOT_CONFIGURED",
        );
      }

      const rewardStroops = xlmToStroops(Number(input.reward));
      const { taskId, transactionHash } = await createTaskOnChain({
        publicKey: input.creator,
        rewardStroops,
        contractId,
      });

      const metadata = {
        taskId,
        title: input.title,
        description: input.description,
        deadline: input.deadline?.trim() || undefined,
        creator: input.creator,
        rewardStroops: rewardStroops.toString(),
        transactionHash,
        createdAt: new Date().toISOString(),
      };

      saveTaskMetadata(metadata);

      return metadata;
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}
