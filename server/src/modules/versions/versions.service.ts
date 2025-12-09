import prisma from "@/config/db";

/**
 * Create a new version of a note
 * @param noteId - ID of the note
 * @param title - Note title at this version
 * @param content - Note content at this version
 * @param createdById - ID of the user creating this version
 * @returns Created note version with auto-incremented version number
 */
export const createNoteVersion = async (
  noteId: number,
  title: string,
  content: any,
  createdById: number
) => {
  // Get the current highest version number
  const latestVersion = await prisma.noteVersion.findFirst({
    where: { noteId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const nextVersion = (latestVersion?.version || 0) + 1;

  return await prisma.noteVersion.create({
    data: {
      noteId,
      title,
      content,
      version: nextVersion,
      createdById,
    },
  });
};

/**
 * Get all versions of a note
 * @param noteId - ID of the note
 * @returns Array of versions ordered by version number (newest first)
 */
export const getNoteVersions = async (noteId: number) => {
  return await prisma.noteVersion.findMany({
    where: { noteId },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      title: true,
      createdById: true,
      createdAt: true,
    },
  });
};

/**
 * Get a specific version of a note
 * @param noteId - ID of the note
 * @param version - Version number to retrieve
 * @returns Note version with full content or null if not found
 */
export const getNoteVersion = async (noteId: number, version: number) => {
  return await prisma.noteVersion.findUnique({
    where: {
      noteId_version: {
        noteId,
        version,
      },
    },
  });
};

/**
 * Restore a note to a specific version
 * @param noteId - ID of the note to restore
 * @param version - Version number to restore to
 * @param userId - ID of the user performing the restore
 * @returns Updated note with restored content
 * @throws Error if version not found
 */
export const restoreNoteVersion = async (
  noteId: number,
  version: number,
  userId: number
) => {
  // Get the version to restore
  const versionToRestore = await getNoteVersion(noteId, version);

  if (!versionToRestore) {
    throw new Error("Version not found");
  }

  // Update the note with the version's content
  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: {
      title: versionToRestore.title,
      content: versionToRestore.content as any,
    },
  });

  // Create a new version for this restore action
  await createNoteVersion(
    noteId,
    versionToRestore.title,
    versionToRestore.content,
    userId
  );

  return updatedNote;
};

/**
 * Get version count for a note
 * @param noteId - ID of the note
 * @returns Total number of versions for the note
 */
export const getNoteVersionCount = async (noteId: number): Promise<number> => {
  return await prisma.noteVersion.count({
    where: { noteId },
  });
};
