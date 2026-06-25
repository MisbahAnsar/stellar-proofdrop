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
import { DashboardTaskRow } from "@/features/dashboard/components/dashboard-task-row";
import type { TaskMetadata } from "@/types/task";

type DashboardSectionProps = {
  title: string;
  description: string;
  tasks: TaskMetadata[];
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  actionHref?: string;
  actionLabel?: string;
};

export function DashboardSection({
  title,
  description,
  tasks,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  actionHref,
  actionLabel,
}: DashboardSectionProps) {
  return (
    <Card className="border-border h-full ring-0">
      <CardHeader className="border-border border-b py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <p className="text-muted-foreground py-6 text-sm">Loading…</p>
        ) : tasks.length === 0 ? (
          <Alert className="mt-4">
            <AlertTitle>{emptyTitle}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{emptyDescription}</span>
              {actionHref && actionLabel ? (
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={actionHref} />}
                >
                  {actionLabel}
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : (
          <ul className="divide-border divide-y">
            {tasks.map((task) => (
              <DashboardTaskRow key={task.taskId} task={task} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
