"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { getProveItContractId } from "@/config/stellar";
import { taskKeys } from "@/features/tasks/query-keys";
import type { CreateTaskFormValues } from "@/features/tasks/schemas/create-task";
import { taskEventBus } from "@/lib/events/task-bus";
import { xlmToStroops } from "@/lib/stellar/amount";
import { ContractError, getErrorMessage } from "@/lib/stellar/errors";
import { createTaskOnChain } from "@/services/stellar/create-task";
import type { TransactionPhase } from "@/services/stellar/transaction-types";
import { saveTaskMetadata } from "@/services/tasks/metadata-store";

type CreateTaskInput = CreateTaskFormValues & {
  creator: string;
};

export type CreateTaskFlowState =
  | { status: "idle" }
  | { status: "pending"; phase: TransactionPhase }
  | { status: "success"; taskId: string; transactionHash: string }
  | { status: "error"; message: string };

export function useCreateTask() {
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<CreateTaskFlowState>({
    status: "idle",
  });

  const resetFlow = useCallback(() => {
    setFlowState({ status: "idle" });
  }, []);

  const mutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const contractId = getProveItContractId();
      if (!contractId) {
        throw new ContractError(
          "ProveIt contract ID is not configured. Set NEXT_PUBLIC_PROVEIT_CONTRACT_ID in your environment.",
          "NOT_CONFIGURED",
        );
      }

      const rewardStroops = xlmToStroops(Number(input.reward));
      const toastId = toast.loading("Creating task on-chain…");

      try {
        const { taskId, transactionHash, ledger } = await createTaskOnChain({
          publicKey: input.creator,
          rewardStroops,
          contractId,
          onProgress: ({ phase, message }) => {
            setFlowState({ status: "pending", phase });
            toast.loading(message, { id: toastId });
          },
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
          ledger,
          status: "open" as const,
        };

        saveTaskMetadata(metadata);

        taskEventBus.emitTaskCreated(metadata);

        toast.success(`Task #${taskId} created on-chain`, {
          id: toastId,
          description: `Transaction ${transactionHash.slice(0, 8)}… confirmed`,
        });

        setFlowState({
          status: "success",
          taskId,
          transactionHash,
        });

        return metadata;
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error("Task creation failed", {
          id: toastId,
          description: message,
        });
        setFlowState({ status: "error", message });
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });

  return {
    ...mutation,
    flowState,
    resetFlow,
  };
}
