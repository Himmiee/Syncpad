import prisma from "@/config/db";
import { SharePermission } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a shareable link for a note
 * @param noteId - ID of the note to share
 * @param createdById - ID of the user creating the link
 * @param permission - Permission level (VIEW or EDIT)
 * @param expiresInDays - Optional expiration in days
 * @returns Created share link with token
 */
export const createShareLink = async (
  noteId: number,
  createdById: number,
  permission: SharePermission = SharePermission.VIEW,
  expiresInDays?: number
) => {
  const token = uuidv4();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  return await prisma.shareLink.create({
    data: {
      token,
      noteId,
      createdById,
      permission,
      expiresAt,
    },
  });
};

/**
 * Get all share links for a note
 * @param noteId - ID of the note
 * @returns Array of share links with creator information
 */
export const getNoteShareLinks = async (noteId: number) => {
  return await prisma.shareLink.findMany({
    where: { noteId },
    include: {
      createdBy: {
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
 * Find a share link by token
 * @param token - Unique share link token
 * @returns Share link with associated note or null
 */
export const findShareLinkByToken = async (token: string) => {
  return await prisma.shareLink.findUnique({
    where: { token },
    include: {
      note: true,
    },
  });
};

/**
 * Update share link properties
 * @param token - Share link token
 * @param data - Properties to update (isActive, permission)
 * @returns Updated share link
 */
export const updateShareLink = async (
  token: string,
  data: { isActive?: boolean; permission?: SharePermission }
) => {
  return await prisma.shareLink.update({
    where: { token },
    data,
  });
};

/**
 * Delete/revoke a share link
 * @param token - Share link token to delete
 */
export const deleteShareLink = async (token: string) => {
  return await prisma.shareLink.delete({
    where: { token },
  });
};

/**
 * Check if a share link is valid and active
 * @param shareLink - Share link object to validate
 * @returns True if link is active and not expired
 */
export const isShareLinkValid = (shareLink: any): boolean => {
  if (!shareLink.isActive) return false;
  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) return false;
  return true;
};
