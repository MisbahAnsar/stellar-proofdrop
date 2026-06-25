"use client";

import { useQuery } from "@tanstack/react-query";

import { proofKeys, taskKeys } from "@/features/tasks/query-keys";
import { getProof } from "@/services/proofs/proof-store";
import { getTaskMetadata } from "@/services/tasks/metadata-store";

export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskMetadata(taskId) ?? null,
    enabled: Boolean(taskId),
  });
}

export function useProof(taskId: string) {
  return useQuery({
    queryKey: proofKeys.detail(taskId),
    queryFn: () => getProof(taskId) ?? null,
    enabled: Boolean(taskId),
  });
}
