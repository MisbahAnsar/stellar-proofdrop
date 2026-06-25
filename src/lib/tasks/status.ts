import type { TaskStatus } from "@/types/task";

export function formatTaskStatus(status?: TaskStatus | string): string {
  switch (status) {
    case "proof_submitted":
      return "awaiting review";
    case "approved":
      return "approved";
    case "open":
      return "open";
    default:
      return status ?? "open";
  }
}

export function isTaskOpen(status?: TaskStatus | string): boolean {
  return !status || status === "open";
}

export function canSubmitProof(status?: TaskStatus | string): boolean {
  return isTaskOpen(status);
}

export function canReviewProof(status?: TaskStatus | string): boolean {
  return status === "proof_submitted";
}
