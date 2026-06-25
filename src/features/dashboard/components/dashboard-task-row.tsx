"use client";

import { memo } from "react";
import Link from "next/link";

import { TaskStatusBadge } from "@/components/ui/task-status-badge";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import type { TaskMetadata } from "@/types/task";

type DashboardTaskRowProps = {
  task: TaskMetadata;
};

export const DashboardTaskRow = memo(function DashboardTaskRow({
  task,
}: DashboardTaskRowProps) {
  return (
    <li className="space-y-1.5 py-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/tasks/${task.taskId}`}
          className="text-foreground focus-visible:ring-ring rounded-sm text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {task.title}
        </Link>
        <div className="flex items-center gap-2">
          <TaskStatusBadge status={task.status} />
          <span className="text-muted-foreground text-xs">
            {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
          </span>
        </div>
      </div>
      <p className="text-muted-foreground line-clamp-1 text-xs">
        #{task.taskId}
        {task.deadline
          ? ` · ${new Date(task.deadline).toLocaleDateString()}`
          : ""}
      </p>
    </li>
  );
});
