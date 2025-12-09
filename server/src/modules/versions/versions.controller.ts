import { Request, Response, NextFunction } from "express";
import {
  getNoteVersions,
  getNoteVersion,
  restoreNoteVersion,
} from "./versions.service";
import { createAuditLog, getRequestMetadata } from "../audit/audit.service";
import { AuditAction } from "@/generated/prisma";

/**
 * Get all versions of a note
 */
export const getVersions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const versions = await getNoteVersions(noteId);

    res.status(200).json({
      message: "Versions retrieved successfully",
      versions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific version of a note
 */
export const getVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);
    const version = parseInt(req.params.version);

    if (isNaN(noteId) || isNaN(version)) {
      return res.status(400).json({ error: "Invalid note ID or version" });
    }

    const noteVersion = await getNoteVersion(noteId, version);

    if (!noteVersion) {
      return res.status(404).json({ error: "Version not found" });
    }

    res.status(200).json({
      message: "Version retrieved successfully",
      version: noteVersion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a note to a specific version
 */
export const restoreVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);
    const version = parseInt(req.params.version);
    const userId = Number(req.userId);

    if (isNaN(noteId) || isNaN(version)) {
      return res.status(400).json({ error: "Invalid note ID or version" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const restoredNote = await restoreNoteVersion(noteId, version, userId);

    // Create audit log for restore action
    const metadata = getRequestMetadata(req);
    await createAuditLog({
      action: AuditAction.RESTORE,
      entityType: "note",
      entityId: noteId,
      userId,
      noteId,
      metadata: { restoredFromVersion: version },
      ...metadata,
    });

    res.status(200).json({
      message: `Note restored to version ${version}`,
      note: restoredNote,
    });
  } catch (error) {
    next(error);
  }
};
