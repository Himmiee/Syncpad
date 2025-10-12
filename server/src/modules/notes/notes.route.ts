import express from "express";
import * as noteControllers from "./notes.controller";
import { AuthMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

/**
 * @route   GET /notes/all
 * @desc    Get all notes belonging to the authenticated user
 * @access  Private (requires JWT)
 */
router.get("/all", AuthMiddleware, noteControllers.GetNotes);

/**
 * @route   POST /notes/create
 * @desc    Create a new note for the authenticated user
 * @access  Private (requires JWT)
 */
router.post("/create", AuthMiddleware, noteControllers.CreateNotes);

/**
 * @route   GET /notes/detail/:id
 * @desc    Get details of a specific note by its ID (only if owned by the user)
 * @access  Private (requires JWT)
 */
router.get("/detail/:id", AuthMiddleware, noteControllers.GetNoteById);

/**
 * @route   PATCH /notes/update/:id
 * @desc    Update a note’s title or content by ID
 * @access  Private (requires JWT)
 */
router.patch("/update/:id", AuthMiddleware, noteControllers.UpdateNoteById);

/**
 * @route   DELETE /notes/delete/:id
 * @desc    Delete a note owned by the authenticated user
 * @access  Private (requires JWT)
 */
router.delete("/delete/:id", AuthMiddleware, noteControllers.DeleteNoteById);

/**
 * @route   POST /notes/:id/collaborators
 * @desc    Add a collaborator to a note (requires note ownership)
 * @access  Private (requires JWT)
 */
router.post(
  "/:id/collaborators",
  AuthMiddleware,
  noteControllers.addCollaboratorToNote
);

/**
 * @route   GET /notes/:id/collaborators
 * @desc    Retrieve all collaborators associated with a specific note
 * @access  Private (requires JWT)
 */
router.get(
  "/:id/collaborators",
  AuthMiddleware,
  noteControllers.getAllCollaborators
);

/**
 * @route   PATCH /notes/:id/collaborators/:collabId
 * @desc    Update a collaborator’s role for a specific note
 * @access  Private (requires JWT)
 */
router.patch(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  noteControllers.updateCollaborator
);

/**
 * @route   DELETE /notes/:id/collaborators/:collabId
 * @desc    Remove a collaborator from a specific note
 * @access  Private (requires JWT)
 */
router.delete(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  noteControllers.deleteCollaborator
);

export default router;
