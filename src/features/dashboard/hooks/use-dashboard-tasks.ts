"use client";

import { useMemo } from "react";

import {
  filterCompletedTasks,
  filterMyTasks,
  filterOpenTasks,
  filterPendingReviews,
} from "@/lib/dashboard/task-filters";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";

export function useDashboardTasks() {
  const { address } = useWallet();
  const { data: tasks = [], isLoading } = useTasks();

  const sections = useMemo(
    () => ({
      myTasks: filterMyTasks(tasks, address ?? undefined),
      openTasks: filterOpenTasks(tasks),
      completedTasks: filterCompletedTasks(tasks),
      pendingReviews: filterPendingReviews(tasks, address ?? undefined),
    }),
    [tasks, address],
  );

  return {
    ...sections,
    isLoading,
    counts: {
      myTasks: sections.myTasks.length,
      openTasks: sections.openTasks.length,
      completedTasks: sections.completedTasks.length,
      pendingReviews: sections.pendingReviews.length,
    },
  };
}
