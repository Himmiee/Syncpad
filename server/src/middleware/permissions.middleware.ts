import { Request, Response, NextFunction } from "express";
import { CollaboratorRole } from "@/generated/prisma";
import { checkNoteAccess, checkTaskAccess } from "@/utils/permissions.utils";

/**
 * Middleware to check if user can view a note
 * User must be owner or a collaborator
 */
export const canViewNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const noteId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const access = await checkNoteAccess(userId, noteId);

    if (!access.hasAccess) {
      return res.status(403).json({ error: "You don't have access to this note" });
    }

    // Attach access info to request for use in controller
    req.noteAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can edit a note
 * User must be owner or an EDITOR collaborator
 */
export const canEditNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const noteId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const access = await checkNoteAccess(userId, noteId, CollaboratorRole.EDITOR);

    if (!access.hasAccess) {
      return res.status(403).json({
        error: "You don't have permission to edit this note",
      });
    }

    req.noteAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can manage collaborators
 * Only the owner can manage collaborators
 */
export const canManageCollaborators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const noteId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const access = await checkNoteAccess(userId, noteId, "OWNER");

    if (!access.hasAccess || !access.isOwner) {
      return res.status(403).json({
        error: "Only the note owner can manage collaborators",
      });
    }

    req.noteAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can view a task
 */
export const canViewTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const taskId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const access = await checkTaskAccess(userId, taskId);

    if (!access.hasAccess) {
      return res.status(403).json({ error: "You don't have access to this task" });
    }

    req.taskAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can edit a task
 */
export const canEditTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const taskId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const access = await checkTaskAccess(userId, taskId, CollaboratorRole.EDITOR);

    if (!access.hasAccess) {
      return res.status(403).json({
        error: "You don't have permission to edit this task",
      });
    }

    req.taskAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};
