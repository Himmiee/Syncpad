import prisma from "@/config/db";
import { Notes } from "../../types/notes";
import { findUserById } from "../user/user.service";
import { CollaboratorRole } from "@/generated/prisma";

/**
 * Get all user notes with pagination support
 * @param id - User ID
 * @param skip - Number of records to skip for pagination
 * @param take - Number of records to take for pagination
 * @returns Object containing notes array and total count
 */
/**
 * Get all user notes with pagination support
 * @param id - User ID
 * @param skip - Number of records to skip for pagination
 * @param take - Number of records to take for pagination
 * @param search - Search query to filter notes (title or content)
 * @returns Object containing notes array and total count
 */
export const getUserNotes = async (
  id: number,
  skip?: number,
  take?: number,
  search?: string
) => {
  const where: any = { ownerId: id };

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { id: "desc" },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    }),
    prisma.note.count({
      where,
    }),
  ]);

  return { notes, total };
};

/**
 * Create a new note for a user
 * @param data - Note data including title, content, and ownerId
 * @returns Created note
 * @throws Error if user not found
 */
export const createUserNote = async (data: Notes) => {
  const user = await findUserById(data.ownerId);
  if (!user) throw new Error("User not found");

  return await prisma.note.create({
    data: {
      title: data.title,
      ownerId: data.ownerId,
      content: data.content,
    },
  });
};

/**
 * Get a single note by its ID with owner and collaborators
 * @param id - Note ID
 * @returns Note with owner and collaborator details or null
 */
export const getNoteById = async (id: number) => {
  return await prisma.note.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      ownerId: true,
      collaborators: true,
      owner: {
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
 * Update a note's title or content
 * @param id - Note ID
 * @param ownerId - Owner's user ID for authorization
 * @param data - Partial note data to update
 * @returns Updated note
 * @throws Error if note not found or not authorized
 */
export const updateNoteWithId = async (
  id: number,
  ownerId: number,
  data: Partial<Notes>
) => {
  const note = await prisma.note.findUnique({
    where: { id },
    select: { ownerId: true, owner: true },
  });
  if (!note) throw new Error("Note not found");

  if (note.ownerId !== ownerId) throw new Error("Not authorized");

  return await prisma.note.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
    },
  });
};

/**
 * Delete a note
 * @param id - Note ID
 * @param ownerId - Owner's user ID for authorization
 * @returns Deleted note
 * @throws Error if note not found or not authorized
 */
export const deleteNoteWithId = async (id: number, ownerId: number) => {
  const note = await prisma.note.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!note) throw new Error("Note not found");
  if (note.ownerId !== ownerId) throw new Error("Not authorized");

  return await prisma.note.delete({
    where: { id },
  });
};

/**
 * Add a collaborator to a note
 * @param noteId - Note ID
 * @param userId - User ID to add as collaborator
 * @param role - Collaborator role (VIEWER or EDITOR)
 * @returns Created collaborator
 * @throws Error if note/user not found or user already a collaborator
 */
export const addCollaborator = async (
  noteId: number,
  userId: number,
  role?: CollaboratorRole
) => {
  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });
  if (!note) throw new Error("Note not found");
  const user = await prisma.note.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  //check for existing collaborations
  const existing = await prisma.collaborator.findFirst({
    where: { noteId, userId },
  });
  if (existing) throw new Error("User already a collaborator");

  return await prisma.collaborator.create({
    data: {
      userId,
      noteId,
      role: role || CollaboratorRole.VIEWER,
    },
  });
};

/**
 * Get all collaborators for a note
 * @param noteId - Note ID
 * @returns Array of collaborators with user details
 * @throws Error if note not found
 */
export const getNoteCollaborators = async (noteId: number) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });
  if (!note) throw new Error("Note not found");
  const collaborators = await prisma.collaborator.findMany({
    where: { noteId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return collaborators;
};

/**
 * Update a collaborator's role
 * @param noteId - Note ID
 * @param collabId - Collaborator ID
 * @param role - New role (VIEWER or EDITOR)
 * @returns Updated collaborator
 * @throws Error if note or collaborator not found
 */
export const updateCollaboratorRole = async (
  noteId: number,
  collabId: number,
  role: CollaboratorRole
) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });
  if (!note) throw new Error("Note not found");

  const collaborator = await prisma.collaborator.findUnique({
    where: { id: collabId },
  });
  if (!collaborator || collaborator.noteId !== noteId) {
    throw new Error("Collaborator not found for this note");
  }
  return await prisma.collaborator.update({
    where: { id: collabId },
    data: { role },
  });
};

/**
 * Remove a collaborator from a note
 * @param noteId - Note ID
 * @param collabId - Collaborator ID to remove
 * @returns Success message
 * @throws Error if note or collaborator not found
 */
export const removeCollaborator = async (noteId: number, collabId: number) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });
  if (!note) throw new Error("Note not found");

  const collaborator = await prisma.collaborator.findUnique({
    where: { id: collabId },
  });

  if (!collaborator || collaborator.noteId !== noteId) {
    throw new Error("Collaborator not found for this note");
  }

  await prisma.collaborator.delete({
    where: { id: collabId },
  });

  return { message: "Collaborator removed successfully" };
};
