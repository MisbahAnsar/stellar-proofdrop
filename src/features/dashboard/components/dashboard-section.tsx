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
          <CardListSkeleton rows={3} label={`Loading ${title.toLowerCase()}`} />
        ) : tasks.length === 0 ? (
          <EmptyState
            className="mt-4"
            title={emptyTitle}
            description={emptyDescription}
            action={
              actionHref && actionLabel ? (
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={actionHref} />}
                >
                  {actionLabel}
                </Button>
              ) : undefined
            }
          />
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
