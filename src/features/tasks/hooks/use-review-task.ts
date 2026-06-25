"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { getProofdropContractId } from "@/config/stellar";
import { taskKeys } from "@/features/tasks/query-keys";
import { taskEventBus } from "@/lib/events/task-bus";
import { ContractError, getErrorMessage } from "@/lib/stellar/errors";
import { approveTaskOnChain } from "@/services/stellar/approve-task";
import { rejectTaskOnChain } from "@/services/stellar/reject-task";
import type { TransactionPhase } from "@/services/stellar/transaction-types";
import { deleteProof } from "@/services/proofs/proof-store";
import { updateTaskMetadata } from "@/services/tasks/metadata-store";

type ReviewTaskInput = {
  taskId: string;
  creator: string;
};

export type ReviewFlowState =
  | { status: "idle" }
  | { status: "pending"; phase: TransactionPhase; action: "approve" | "reject" }
  | {
      status: "success";
      action: "approve" | "reject";
      transactionHash: string;
    }
  | { status: "error"; message: string };

export function useReviewTask() {
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<ReviewFlowState>({
    status: "idle",
  });

  const resetFlow = useCallback(() => {
    setFlowState({ status: "idle" });
  }, []);

  const approveMutation = useMutation({
    mutationFn: async ({ taskId, creator }: ReviewTaskInput) => {
      const contractId = getProofdropContractId();
      if (!contractId) {
        throw new ContractError(
          "Proofdrop contract ID is not configured.",
          "NOT_CONFIGURED",
        );
      }

      const toastId = toast.loading("Approving proof on-chain…");
      setFlowState({
        status: "pending",
        phase: "preparing",
        action: "approve",
      });

      try {
        const { transactionHash, ledger } = await approveTaskOnChain({
          publicKey: creator,
          taskId,
          contractId,
          onProgress: ({ phase, message }) => {
            setFlowState({ status: "pending", phase, action: "approve" });
            toast.loading(message, { id: toastId });
          },
        });

        const reviewedAt = new Date().toISOString();
        const updatedTask = updateTaskMetadata(taskId, {
          status: "approved",
          reviewAction: "approved",
          reviewedBy: creator,
          reviewedAt,
          reviewTransactionHash: transactionHash,
          ledger,
        });

        if (updatedTask) {
          taskEventBus.emitTaskUpdated(updatedTask);
        }

        taskEventBus.emitRefresh();

        toast.success(`Task #${taskId} approved`, {
          id: toastId,
          description: `Payment released. Transaction ${transactionHash.slice(0, 8)}…`,
        });

        setFlowState({
          status: "success",
          action: "approve",
          transactionHash,
        });

        return updatedTask;
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error("Approval failed", {
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

  const rejectMutation = useMutation({
    mutationFn: async ({ taskId, creator }: ReviewTaskInput) => {
      const contractId = getProofdropContractId();
      if (!contractId) {
        throw new ContractError(
          "Proofdrop contract ID is not configured.",
          "NOT_CONFIGURED",
        );
      }

      const toastId = toast.loading("Rejecting proof on-chain…");
      setFlowState({ status: "pending", phase: "preparing", action: "reject" });

      try {
        const { transactionHash, ledger } = await rejectTaskOnChain({
          publicKey: creator,
          taskId,
          contractId,
          onProgress: ({ phase, message }) => {
            setFlowState({ status: "pending", phase, action: "reject" });
            toast.loading(message, { id: toastId });
          },
        });

        const reviewedAt = new Date().toISOString();
        deleteProof(taskId);

        const updatedTask = updateTaskMetadata(taskId, {
          status: "open",
          reviewAction: "rejected",
          reviewedBy: creator,
          reviewedAt,
          reviewTransactionHash: transactionHash,
          ledger,
          proofHash: undefined,
          proofSubmittedBy: undefined,
          proofSubmittedAt: undefined,
          proofTransactionHash: undefined,
        });

        if (updatedTask) {
          taskEventBus.emitTaskUpdated(updatedTask);
        }

        taskEventBus.emitRefresh();

        toast.success(`Task #${taskId} reopened`, {
          id: toastId,
          description: `Proof rejected. Task is open for resubmission.`,
        });

        setFlowState({
          status: "success",
          action: "reject",
          transactionHash,
        });

        return updatedTask;
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error("Rejection failed", {
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
    approve: approveMutation,
    reject: rejectMutation,
    isPending: approveMutation.isPending || rejectMutation.isPending,
    flowState,
    resetFlow,
  };
}
