"use client";

import { useContractEventListener } from "@/features/tasks/hooks/use-contract-events";
import { useTaskListSync } from "@/features/tasks/hooks/use-tasks";
import { useActivityRecorder } from "@/features/dashboard/hooks/use-activity-recorder";
import { useActivitySync } from "@/features/dashboard/hooks/use-recent-activity";

export function TaskEventSync() {
  useTaskListSync();
  useActivitySync();
  useActivityRecorder();
  useContractEventListener();
  return null;
}
