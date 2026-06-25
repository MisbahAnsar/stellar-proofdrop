"use client";

import { useMemo } from "react";

import { filterPendingReviews } from "@/lib/dashboard/task-filters";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";

export function usePendingReviews() {
  const { address } = useWallet();
  const { data: tasks = [], isLoading } = useTasks();

  const pendingReviews = useMemo(
    () => filterPendingReviews(tasks, address ?? undefined),
    [tasks, address],
  );

  return {
    pendingReviews,
    count: pendingReviews.length,
    isLoading,
  };
}
