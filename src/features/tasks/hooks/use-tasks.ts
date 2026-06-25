"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { taskKeys } from "@/features/tasks/query-keys";
import { taskEventBus } from "@/lib/events/task-bus";
import { getTaskMetadataList } from "@/services/tasks/metadata-store";

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: getTaskMetadataList,
    staleTime: 0,
  });
}

export function useTaskListSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribeRefresh = taskEventBus.onRefresh(() => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    });

    const unsubscribeCreated = taskEventBus.onTaskCreated(() => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    });

    const unsubscribeUpdated = taskEventBus.onTaskUpdated(() => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    });

    return () => {
      unsubscribeRefresh();
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [queryClient]);
}
