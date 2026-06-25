import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { PageHeader } from "@/components/layout/page-header";

export default function CreateTaskPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create Task"
        description="Fund a new task with XLM and define what proof workers must provide."
      />
      <CreateTaskForm />
    </div>
  );
}
