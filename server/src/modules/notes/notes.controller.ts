import { Request, Response, NextFunction } from "express";
import {
  addCollaborator,
  createUserNote,
  deleteNoteWithId,
  getNoteById,
  getNoteCollaborators,
  getUserNotes,
  removeCollaborator,
  updateCollaboratorRole,
  updateNoteWithId,
} from "./notes.services";
import { CollaboratorRole } from "@/generated/prisma";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "@/utils/pagination.utils";

// Create notes for user
export const CreateNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content } = req.body;
    const ownerId = Number(req.userId);
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const note = await createUserNote({ title, content, ownerId });

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (err) {
    next(err);
  }
};

//  Get all notes for a given user with pagination
export const GetNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    // Get pagination parameters from query
    const { page, limit, skip } = getPaginationParams(req);
    const search = req.query.search as string | undefined;

    // Fetch notes with pagination and search
    const { notes, total } = await getUserNotes(Number(userId), skip, limit, search);

    // Create paginated response
    const response = createPaginatedResponse(notes, total, page, limit);

    return res.status(200).json({
      message: "Notes retrieved successfully",
      ...response,
    });
  } catch (err) {
    next(err);
  }
};

// Get single note by note ID
export const GetNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Valid note ID is required" });
    }

    const note = await getNoteById(Number(id));

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json({
      message: "Note retrieved successfully",
      note,
    });
  } catch (err) {
    next(err);
  }
};

// patch single note
export const UpdateNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;
    const { title, content } = req.body;

    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Valid note ID is required" });
    }

    const note = await getNoteById(Number(id));
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const updatedNote = await updateNoteWithId(Number(id), Number(ownerId), {
      title,
      content,
    });

    return res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (err) {
    next(err);
  }
};

export const DeleteNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Valid note ID is required" });
    }

    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await deleteNoteWithId(Number(id), Number(ownerId));

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (err: any) {
    next(err);
  }
};

// add collaborator to note
export const addCollaboratorToNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);
    const { userId, role } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "userId is required" });
    }
    const collaborator = await addCollaborator(noteId, userId, role);
    return res.status(201).json({
      message: "Collaborator added successfully",
      collaborator,
    });
  } catch (err) {
    next(err);
  }
};

//get note collaborators
export const getAllCollaborators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noteId = parseInt(req.params.id);

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const collaborators = await getNoteCollaborators(noteId);

    res.status(200).json({
      message: "Collaborators fetched successfully",
      collaborators,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCollaborator = async (req: Request, res: Response) => {
  try {
    const noteId = parseInt(req.params.id);
    const collabId = parseInt(req.params.collabId);
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }

    if (!Object.values(CollaboratorRole).includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${Object.values(
          CollaboratorRole
        ).join(", ")}`,
      });
    }

    const updated = await updateCollaboratorRole(
      noteId,
      collabId,
      role as CollaboratorRole
    );

    res.status(200).json({
      message: "Collaborator role updated successfully",
      collaborator: updated,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const deleteCollaborator = async (req: Request, res: Response) => {
  try {
    const noteId = parseInt(req.params.id);
    const collabId = parseInt(req.params.collabId);

    if (isNaN(noteId) || isNaN(collabId)) {
      return res.status(400).json({ error: "Invalid note or collaborator ID" });
    }

    const result = await removeCollaborator(noteId, collabId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
