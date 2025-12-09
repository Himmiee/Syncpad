import { z } from "zod";
import { TaskStatus, CollaboratorRole } from "@/generated/prisma";

// Schema for creating a task
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  status: z
    .nativeEnum(TaskStatus, {
      message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    })
    .optional()
    .default(TaskStatus.TODO),
});

// Schema for updating a task
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  status: z
    .nativeEnum(TaskStatus, {
      message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    })
    .optional(),
});

// Schema for updating task status only
export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
  }),
});

// Schema for adding a collaborator to a task
export const addTaskCollaboratorSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  role: z
    .nativeEnum(CollaboratorRole, {
      message: `Role must be one of: ${Object.values(CollaboratorRole).join(", ")}`,
    })
    .optional()
    .default(CollaboratorRole.VIEWER),
});

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type AddTaskCollaboratorInput = z.infer<typeof addTaskCollaboratorSchema>;
