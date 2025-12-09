import { Request, Response, NextFunction } from "express";
import {
  createShareLink,
  getNoteShareLinks,
  findShareLinkByToken,
  updateShareLink,
  deleteShareLink,
  isShareLinkValid,
} from "./share.service";
import { SharePermission } from "@/generated/prisma";
import { createAuditLog, getRequestMetadata } from "../audit/audit.service";
import { AuditAction } from "@/generated/prisma";

/**
 * Create a shareable link for a note
 */
export const createLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);
    const userId = Number(req.userId);
    const { permission, expiresInDays } = req.body;

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const shareLink = await createShareLink(
      noteId,
      userId,
      permission || SharePermission.VIEW,
      expiresInDays
    );

    // Create audit log
    const metadata = getRequestMetadata(req);
    await createAuditLog({
      action: AuditAction.SHARE,
      entityType: "note",
      entityId: noteId,
      userId,
      noteId,
      metadata: { shareToken: shareLink.token, permission: shareLink.permission },
      ...metadata,
    });

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareLink.token}`;

    res.status(201).json({
      message: "Share link created successfully",
      shareLink,
      url: shareUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all share links for a note
 */
export const getLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const links = await getNoteShareLinks(noteId);

    res.status(200).json({
      message: "Share links retrieved successfully",
      links,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Access a shared note (public endpoint)
 */
export const accessSharedNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const shareLink = await findShareLinkByToken(token);

    if (!shareLink) {
      return res.status(404).json({ error: "Invalid or expired link" });
    }

    if (!isShareLinkValid(shareLink)) {
      return res.status(403).json({ error: "Link has expired or been revoked" });
    }

    res.status(200).json({
      note: shareLink.note,
      permission: shareLink.permission,
      canEdit: shareLink.permission === SharePermission.EDIT,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a share link
 */
export const updateLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { isActive, permission } = req.body;

    const updated = await updateShareLink(token, { isActive, permission });

    res.status(200).json({
      message: "Share link updated successfully",
      shareLink: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete/revoke a share link
 */
export const deleteLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    await deleteShareLink(token);

    res.status(200).json({
      message: "Share link revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};
