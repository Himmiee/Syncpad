import prisma from "@/config/db";
import { Notes } from "../../types/notes";
import { findUserById } from "../user/user.service";
import { CollaboratorRole } from "@/generated/prisma";

// Get all user notes
export const getUserNotes = async (id: number) => {
  return await prisma.note.findMany({
    where: { ownerId: id },
    orderBy: { id: "desc" },
  });
};

// Create user note
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

// Get a single note by its ID
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

// Update a user note
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

// Delete user note
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

//Add Collaborator to note
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
