"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/components/task-list";
import { useTasks } from "@/features/tasks/hooks/use-tasks";

export default function HomePage() {
  const { data: tasks = [], isLoading } = useTasks();

  return (
    <div className="space-y-8">
      <PageHeader
        title="ProveIt"
        description="Create funded tasks on Stellar Soroban. Rewards are locked on-chain until proof is approved."
        action={<Button render={<Link href="/create" />}>Create Task</Button>}
      />

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        emptyTitle="No open tasks"
        emptyDescription="Fund a task to get started. Lists refresh automatically after on-chain confirmation."
      />
    </div>
  );
}
