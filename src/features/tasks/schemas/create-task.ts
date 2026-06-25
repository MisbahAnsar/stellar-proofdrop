import { z } from "zod";

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be at most 2000 characters"),
    reward: z
      .string()
      .trim()
      .min(1, "Reward is required")
      .refine((value) => {
        const amount = Number(value);
        return Number.isFinite(amount) && amount > 0;
      }, "Reward must be a positive number")
      .refine((value) => {
        const amount = Number(value);
        return amount <= 1_000_000;
      }, "Reward must not exceed 1,000,000 XLM"),
    deadline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.deadline?.trim()) {
      return;
    }

    const deadline = new Date(data.deadline);
    if (Number.isNaN(deadline.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid deadline",
        path: ["deadline"],
      });
      return;
    }

    if (deadline.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        message: "Deadline must be in the future",
        path: ["deadline"],
      });
    }
  });

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
