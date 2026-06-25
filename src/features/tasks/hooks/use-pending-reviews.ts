"use client";

import { useMemo } from "react";

import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";

export function usePendingReviews() {
  const { address } = useWallet();
  const { data: tasks = [], isLoading } = useTasks();

  const pendingReviews = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.creator === address && task.status === "proof_submitted",
      ),
    [tasks, address],
  );

  return {
    pendingReviews,
    count: pendingReviews.length,
    isLoading,
  };
}
