import { CreateTaskForm } from "@/features/tasks/components/create-task-form";

export default function CreateTaskPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Create Task
        </h1>
        <p className="text-muted-foreground text-sm">
          Fund a new task with XLM and define what proof workers must provide.
        </p>
      </div>

      <CreateTaskForm />
    </div>
  );
}
