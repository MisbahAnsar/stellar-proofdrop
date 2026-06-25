"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { activityKeys } from "@/features/tasks/query-keys";
import { taskEventBus } from "@/lib/events/task-bus";
import { getRecentActivity } from "@/services/activity/activity-store";

export function useRecentActivity() {
  return useQuery({
    queryKey: activityKeys.recent(),
    queryFn: () => getRecentActivity(),
    staleTime: 0,
  });
}

export function useActivitySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: activityKeys.all });
    };

    const unsubscribeActivity = taskEventBus.onActivity(invalidate);
    const unsubscribeRefresh = taskEventBus.onRefresh(invalidate);
    const unsubscribeCreated = taskEventBus.onTaskCreated(invalidate);
    const unsubscribeUpdated = taskEventBus.onTaskUpdated(invalidate);

    return () => {
      unsubscribeActivity();
      unsubscribeRefresh();
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [queryClient]);
}
