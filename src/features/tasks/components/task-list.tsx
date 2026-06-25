import Link from "next/link";

import { CardListSkeleton } from "@/components/skeletons/card-list-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/ui/task-status-badge";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import type { TaskMetadata } from "@/types/task";

type TaskListProps = {
  tasks: TaskMetadata[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  title?: string;
};

export function TaskList({
  tasks,
  isLoading = false,
  emptyTitle = "No tasks yet",
  emptyDescription = "Create your first funded task to see it here.",
  title = "Tasks",
}: TaskListProps) {
  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardHeader className="border-border border-b">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <CardListSkeleton rows={4} label={`Loading ${title.toLowerCase()}`} />
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button size="sm" variant="outline" render={<Link href="/create" />}>
            Create Task
          </Button>
        }
      />
    );
  }

  return (
    <Card className="surface-card">
      <CardHeader className="border-border border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {tasks.length} task{tasks.length === 1 ? "" : "s"} funded on-chain
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-border divide-y" aria-label={title}>
          {tasks.map((task) => (
            <li
              key={task.taskId}
              className="hover:bg-muted/40 space-y-2 p-4 transition-colors"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/tasks/${task.taskId}`}
                  className="text-foreground focus-visible:ring-ring rounded-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {task.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                  <span className="text-muted-foreground text-sm">
                    {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {task.description}
              </p>
              <p className="text-muted-foreground text-xs break-words">
                Task #{task.taskId}
                {task.deadline
                  ? ` · Deadline ${new Date(task.deadline).toLocaleString()}`
                  : ""}
                {task.ledger ? ` · Ledger ${task.ledger}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
