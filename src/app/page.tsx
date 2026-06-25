"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/components/task-list";
import { useTasks } from "@/features/tasks/hooks/use-tasks";

export default function HomePage() {
  const { data: tasks = [], isLoading } = useTasks();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            ProveIt
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Create funded tasks on Stellar Soroban. Rewards are locked on-chain
            until proof is approved.
          </p>
        </div>
        <Button render={<Link href="/create" />}>Create Task</Button>
      </section>

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        emptyTitle="No open tasks"
        emptyDescription="Fund a task to get started. Lists refresh automatically after on-chain confirmation."
      />
    </div>
  );
}
