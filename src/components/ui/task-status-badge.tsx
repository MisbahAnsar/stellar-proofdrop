import { cn } from "@/lib/utils";
import { formatTaskStatus } from "@/lib/tasks/status";
import type { TaskStatus } from "@/types/task";

const STATUS_STYLES: Record<string, string> = {
  open: "border-sky-200 bg-sky-50 text-sky-800",
  proof_submitted: "border-amber-200 bg-amber-50 text-amber-900",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

type TaskStatusBadgeProps = {
  status?: TaskStatus | string;
  className?: string;
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const key = status ?? "open";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[key] ?? STATUS_STYLES.open,
        className,
      )}
    >
      {formatTaskStatus(status)}
    </span>
  );
}
