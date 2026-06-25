"use client";

import { useEffect } from "react";

import { taskEventBus } from "@/lib/events/task-bus";
import {
  activityFromCreatedTask,
  activityFromUpdatedTask,
} from "@/lib/dashboard/activity-from-task";
import { appendActivity } from "@/services/activity/activity-store";

function recordActivity(entry: ReturnType<typeof activityFromCreatedTask>) {
  appendActivity(entry);
  taskEventBus.emitActivity(entry);
}

export function useActivityRecorder() {
  useEffect(() => {
    const unsubscribeCreated = taskEventBus.onTaskCreated((task) => {
      recordActivity(activityFromCreatedTask(task));
    });

    const unsubscribeUpdated = taskEventBus.onTaskUpdated((task) => {
      const entry = activityFromUpdatedTask(task);
      if (entry) {
        recordActivity(entry);
      }
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, []);
}
