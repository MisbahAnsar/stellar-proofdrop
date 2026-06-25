import { TaskDetail } from "@/features/tasks/components/task-detail";

type TaskPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <TaskDetail taskId={taskId} />
    </div>
  );
}
