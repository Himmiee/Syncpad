import { z } from "zod";
import { CollaboratorRole } from "@/generated/prisma";

// Schema for creating a note
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  content: z.any().optional(), // JSON content, flexible structure
});

// Schema for updating a note
export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  content: z.any().optional(),
});

// Schema for adding a collaborator
export const addCollaboratorSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer").optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z
    .nativeEnum(CollaboratorRole, {
      message: `Role must be one of: ${Object.values(CollaboratorRole).join(", ")}`,
    })
    .optional()
    .default(CollaboratorRole.VIEWER),
}).refine((data) => data.userId || data.email, {
  message: "Either userId or email must be provided",
  path: ["email"],
});

// Schema for updating collaborator role
export const updateCollaboratorSchema = z.object({
  role: z.nativeEnum(CollaboratorRole, {
    message: `Role must be one of: ${Object.values(CollaboratorRole).join(", ")}`,
  }),
});

// Type exports for use in controllers
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type UpdateCollaboratorInput = z.infer<typeof updateCollaboratorSchema>;
