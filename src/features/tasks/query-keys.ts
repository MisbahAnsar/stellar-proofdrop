export const taskKeys = {
  all: ["tasks"] as const,
  list: () => [...taskKeys.all, "list"] as const,
  detail: (taskId: string) => [...taskKeys.all, "detail", taskId] as const,
};

export const proofKeys = {
  all: ["proofs"] as const,
  detail: (taskId: string) => [...proofKeys.all, "detail", taskId] as const,
};
