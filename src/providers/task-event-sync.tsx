"use client";

import { useContractEventListener } from "@/features/tasks/hooks/use-contract-events";
import { useTaskListSync } from "@/features/tasks/hooks/use-tasks";

export function TaskEventSync() {
  useTaskListSync();
  useContractEventListener();
  return null;
}
