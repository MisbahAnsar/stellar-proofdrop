import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import type { TaskMetadata } from "@/types/task";

type TaskListProps = {
  tasks: TaskMetadata[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function TaskList({
  tasks,
  isLoading = false,
  emptyTitle = "No tasks yet",
  emptyDescription = "Create your first funded task to see it here.",
}: TaskListProps) {
  if (isLoading) {
    return (
      <Card className="border-border ring-0">
        <CardContent className="text-muted-foreground py-8 text-sm">
          Loading tasks…
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertTitle>{emptyTitle}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{emptyDescription}</span>
          <Button size="sm" variant="outline" render={<Link href="/create" />}>
            Create Task
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-border ring-0">
      <CardHeader className="border-border border-b">
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          {tasks.length} task{tasks.length === 1 ? "" : "s"} funded on-chain
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-border divide-y">
          {tasks.map((task) => (
            <li key={task.taskId} className="space-y-1 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-foreground font-medium">{task.title}</p>
                <p className="text-muted-foreground text-sm">
                  {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
                </p>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {task.description}
              </p>
              <p className="text-muted-foreground text-xs">
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
