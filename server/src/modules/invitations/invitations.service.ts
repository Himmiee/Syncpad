import prisma from "@/config/db";
import { CollaboratorRole, InvitationStatus } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Create an invitation to collaborate on a note
 * @param email - Email address of the person to invite
 * @param noteId - ID of the note to share
 * @param invitedById - ID of the user sending the invitation
 * @param role - Collaborator role (VIEWER or EDITOR)
 * @returns Created invitation with token
 * @throws Error if user is already invited
 */
export const createInvitation = async (
  email: string,
  noteId: number,
  invitedById: number,
  role: CollaboratorRole = CollaboratorRole.VIEWER
) => {
  // Check if invitation already exists
  const existing = await prisma.invitation.findUnique({
    where: {
      email_noteId: {
        email,
        noteId,
      },
    },
  });

  if (existing && existing.status === InvitationStatus.PENDING) {
    throw new Error("User already invited");
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return await prisma.invitation.create({
    data: {
      email,
      noteId,
      invitedById,
      role,
      token,
      expiresAt,
    },
  });
};

/**
 * Find invitation by token
 * @param token - Unique invitation token from email
 * @returns Invitation with note and inviter details or null
 */
export const findInvitationByToken = async (token: string) => {
  return await prisma.invitation.findUnique({
    where: { token },
    include: {
      note: true,
      invitedBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get all invitations for a note
 * @param noteId - ID of the note
 * @returns Array of invitations with inviter information
 */
export const getNoteInvitations = async (noteId: number) => {
  return await prisma.invitation.findMany({
    where: { noteId },
    include: {
      invitedBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Update invitation status
 * @param id - Invitation ID
 * @param status - New status (PENDING, ACCEPTED, EXPIRED, REVOKED)
 * @returns Updated invitation
 */
export const updateInvitationStatus = async (
  id: number,
  status: InvitationStatus
) => {
  return await prisma.invitation.update({
    where: { id },
    data: { status },
  });
};

/**
 * Delete/revoke an invitation
 * @param id - Invitation ID to delete
 */
export const deleteInvitation = async (id: number) => {
  return await prisma.invitation.delete({
    where: { id },
  });
};

/**
 * Check if invitation is valid and not expired
 * @param invitation - Invitation object to validate
 * @returns True if invitation is pending and not expired
 */
export const isInvitationValid = (invitation: any): boolean => {
  if (invitation.status !== InvitationStatus.PENDING) return false;
  if (invitation.expiresAt < new Date()) return false;
  return true;
};
