import prisma from "@/config/db";
import { CollaboratorRole } from "@/generated/prisma";

export interface AccessResult {
  hasAccess: boolean;
  role?: CollaboratorRole | "OWNER";
  isOwner: boolean;
}

/**
 * Check if a user has access to a note and their role
 * @param userId - User ID to check
 * @param noteId - Note ID to check access for
 * @param requiredRole - Optional minimum required role
 * @returns Access result with role information
 */
export const checkNoteAccess = async (
  userId: number,
  noteId: number,
  requiredRole?: CollaboratorRole | "OWNER"
): Promise<AccessResult> => {
  // Check if user owns the note
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { ownerId: true },
  });

  if (!note) {
    return { hasAccess: false, isOwner: false };
  }

  // Owner has full access
  if (note.ownerId === userId) {
    return { hasAccess: true, role: "OWNER", isOwner: true };
  }

  // Check if user is a collaborator
  const collaborator = await prisma.collaborator.findFirst({
    where: {
      userId,
      noteId,
    },
    select: { role: true },
  });

  if (!collaborator) {
    return { hasAccess: false, isOwner: false };
  }

  // Check if collaborator has required role
  if (requiredRole) {
    if (requiredRole === "OWNER") {
      return { hasAccess: false, role: collaborator.role, isOwner: false };
    }
    if (requiredRole === CollaboratorRole.EDITOR && collaborator.role === CollaboratorRole.VIEWER) {
      return { hasAccess: false, role: collaborator.role, isOwner: false };
    }
  }

  return { hasAccess: true, role: collaborator.role, isOwner: false };
};

/**
 * Check if a user has access to a task and their role
 * @param userId - User ID to check
 * @param taskId - Task ID to check access for
 * @param requiredRole - Optional minimum required role
 * @returns Access result with role information
 */
export const checkTaskAccess = async (
  userId: number,
  taskId: number,
  requiredRole?: CollaboratorRole | "OWNER"
): Promise<AccessResult> => {
  // Check if user owns the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { ownerId: true },
  });

  if (!task) {
    return { hasAccess: false, isOwner: false };
  }

  // Owner has full access
  if (task.ownerId === userId) {
    return { hasAccess: true, role: "OWNER", isOwner: true };
  }

  // Check if user is a collaborator
  const collaborator = await prisma.collaborator.findFirst({
    where: {
      userId,
      taskId,
    },
    select: { role: true },
  });

  if (!collaborator) {
    return { hasAccess: false, isOwner: false };
  }

  // Check if collaborator has required role
  if (requiredRole) {
    if (requiredRole === "OWNER") {
      return { hasAccess: false, role: collaborator.role, isOwner: false };
    }
    if (requiredRole === CollaboratorRole.EDITOR && collaborator.role === CollaboratorRole.VIEWER) {
      return { hasAccess: false, role: collaborator.role, isOwner: false };
    }
  }

  return { hasAccess: true, role: collaborator.role, isOwner: false };
};

/**
 * Check if user is the owner of a note
 */
export const isNoteOwner = async (
  userId: number,
  noteId: number
): Promise<boolean> => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { ownerId: true },
  });

  return note?.ownerId === userId;
};

/**
 * Check if user is the owner of a task
 */
export const isTaskOwner = async (
  userId: number,
  taskId: number
): Promise<boolean> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { ownerId: true },
  });

  return task?.ownerId === userId;
};
