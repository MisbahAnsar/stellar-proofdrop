"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { getProofdropContractId } from "@/config/stellar";
import { proofKeys, taskKeys } from "@/features/tasks/query-keys";
import { taskEventBus } from "@/lib/events/task-bus";
import { sha256HexFromFile } from "@/lib/proof/hash";
import { ContractError, getErrorMessage } from "@/lib/stellar/errors";
import { readFileAsDataUrl } from "@/services/proofs/file";
import { saveProof } from "@/services/proofs/proof-store";
import { submitProofOnChain } from "@/services/stellar/submit-proof";
import type { TransactionPhase } from "@/services/stellar/transaction-types";
import { updateTaskMetadata } from "@/services/tasks/metadata-store";
import type { StoredProof } from "@/types/proof";

type SubmitProofInput = {
  taskId: string;
  file: File;
  worker: string;
};

export type SubmitProofFlowState =
  | { status: "idle" }
  | { status: "hashing" }
  | { status: "pending"; phase: TransactionPhase }
  | { status: "success"; proofHash: string; transactionHash: string }
  | { status: "error"; message: string };

export function useSubmitProof() {
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<SubmitProofFlowState>({
    status: "idle",
  });

  const resetFlow = useCallback(() => {
    setFlowState({ status: "idle" });
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ taskId, file, worker }: SubmitProofInput) => {
      const contractId = getProofdropContractId();
      if (!contractId) {
        throw new ContractError(
          "Proofdrop contract ID is not configured.",
          "NOT_CONFIGURED",
        );
      }

      const toastId = toast.loading("Hashing proof file…");
      setFlowState({ status: "hashing" });

      try {
        const [sha256, dataUrl] = await Promise.all([
          sha256HexFromFile(file),
          readFileAsDataUrl(file),
        ]);

        const storedProof: StoredProof = {
          taskId,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          sha256,
          submittedBy: worker,
          submittedAt: new Date().toISOString(),
        };

        const { transactionHash, ledger } = await submitProofOnChain({
          publicKey: worker,
          taskId,
          proofHashHex: sha256,
          contractId,
          onProgress: ({ phase, message }) => {
            setFlowState({ status: "pending", phase });
            toast.loading(message, { id: toastId });
          },
        });

        saveProof(storedProof);

        const updatedTask = updateTaskMetadata(taskId, {
          status: "proof_submitted",
          proofHash: sha256,
          proofSubmittedBy: worker,
          proofSubmittedAt: storedProof.submittedAt,
          proofTransactionHash: transactionHash,
          ledger,
        });

        if (updatedTask) {
          taskEventBus.emitTaskUpdated(updatedTask);
        }

        taskEventBus.emitRefresh();

        toast.success(`Proof submitted for task #${taskId}`, {
          id: toastId,
          description: `Hash ${sha256.slice(0, 8)}… stored on-chain`,
        });

        setFlowState({
          status: "success",
          proofHash: sha256,
          transactionHash,
        });

        return storedProof;
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error("Proof submission failed", {
          id: toastId,
          description: message,
        });
        setFlowState({ status: "error", message });
        throw error;
      }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: taskKeys.all }),
        queryClient.invalidateQueries({
          queryKey: proofKeys.detail(variables.taskId),
        }),
      ]);
    },
  });

  return {
    ...mutation,
    flowState,
    resetFlow,
  };
}
