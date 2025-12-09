import { Request, Response, NextFunction } from "express";
import {
  createInvitation,
  findInvitationByToken,
  getNoteInvitations,
  updateInvitationStatus,
  deleteInvitation,
  isInvitationValid,
} from "./invitations.service";
import { sendInvitationEmail } from "@/config/email.config";
import { addCollaborator } from "../notes/notes.services";
import { findUserById } from "../user/user.service";
import { getNoteById } from "../notes/notes.services";
import { InvitationStatus } from "@/generated/prisma";
import { createAuditLog, getRequestMetadata } from "../audit/audit.service";
import { AuditAction } from "@/generated/prisma";

/**
 * Send an invitation
 */
export const sendInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId, email, role } = req.body;
    const userId = Number(req.userId);

    if (!email || !noteId) {
      return res.status(400).json({ error: "Email and note ID are required" });
    }

    // Get note and inviter info
    const note = await getNoteById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const inviter = await findUserById(userId);
    if (!inviter) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create invitation
    const invitation = await createInvitation(email, noteId, userId, role);

    // Send email
    try {
      await sendInvitationEmail(
        email,
        inviter.username,
        note.title,
        invitation.token
      );
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Continue even if email fails
    }

    // Create audit log
    const metadata = getRequestMetadata(req);
    await createAuditLog({
      action: AuditAction.INVITE,
      entityType: "note",
      entityId: noteId,
      userId,
      noteId,
      metadata: { invitedEmail: email, role },
      ...metadata,
    });

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error: any) {
    if (error.message === "User already invited") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Get all invitations for a note
 */
export const getInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const invitations = await getNoteInvitations(noteId);

    res.status(200).json({
      message: "Invitations retrieved successfully",
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept an invitation
 */
export const acceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const userId = Number(req.userId);

    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to accept invitations" });
    }

    // Find invitation
    const invitation = await findInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ error: "Invalid invitation" });
    }

    // Validate invitation
    if (!isInvitationValid(invitation)) {
      return res.status(400).json({ error: "Invitation has expired or already been used" });
    }

    // Verify email matches
    const user = await findUserById(userId);
    if (user.email !== invitation.email) {
      return res.status(403).json({ error: "This invitation is for a different email address" });
    }

    // Add as collaborator
    await addCollaborator(invitation.noteId, userId, invitation.role);

    // Update invitation status
    await updateInvitationStatus(invitation.id, InvitationStatus.ACCEPTED);

    res.status(200).json({
      message: "Invitation accepted successfully",
      noteId: invitation.noteId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke an invitation
 */
export const revokeInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid invitation ID" });
    }

    await deleteInvitation(id);

    res.status(200).json({
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};
