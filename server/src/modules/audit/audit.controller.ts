import { Request, Response, NextFunction } from "express";
import {
  getNoteAuditLogs,
  getUserAuditLogs,
} from "./audit.service";

/**
 * Get audit logs for a specific note
 */
export const getNoteAudit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const logs = await getNoteAuditLogs(noteId, limit);

    res.status(200).json({
      message: "Audit logs retrieved successfully",
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for the authenticated user
 */
export const getMyAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const limit = parseInt(req.query.limit as string) || 100;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const logs = await getUserAuditLogs(userId, limit);

    res.status(200).json({
      message: "Audit logs retrieved successfully",
      logs,
    });
  } catch (error) {
    next(error);
  }
};
