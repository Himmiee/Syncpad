import express from "express";
import * as noteControllers from "./notes.controller";
import { AuthMiddleware } from "@/middleware/authMiddleware";
import { validate } from "@/middleware/validator.middleware";
import {
  createNoteSchema,
  updateNoteSchema,
  addCollaboratorSchema,
  updateCollaboratorSchema,
} from "./notes.validator";
import {
  canViewNote,
  canEditNote,
  canManageCollaborators,
} from "@/middleware/permissions.middleware";

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
router.post(
  "/create",
  AuthMiddleware,
  validate(createNoteSchema),
  noteControllers.CreateNotes
);

/**
 * @route   GET /notes/detail/:id
 * @desc    Get details of a specific note by its ID (only if owned by the user)
 * @access  Private (requires JWT + view permission)
 */
router.get(
  "/detail/:id",
  AuthMiddleware,
  canViewNote,
  noteControllers.GetNoteById
);

/**
 * @route   PATCH /notes/update/:id
 * @desc    Update a note's title or content by ID
 * @access  Private (requires JWT + edit permission)
 */
router.patch(
  "/update/:id",
  AuthMiddleware,
  canEditNote,
  validate(updateNoteSchema),
  noteControllers.UpdateNoteById
);

/**
 * @route   DELETE /notes/delete/:id
 * @desc    Delete a note owned by the authenticated user
 * @access  Private (requires JWT + owner permission)
 */
router.delete(
  "/delete/:id",
  AuthMiddleware,
  canManageCollaborators,
  noteControllers.DeleteNoteById
);

/**
 * @route   POST /notes/:id/collaborators
 * @desc    Add a collaborator to a note (requires note ownership)
 * @access  Private (requires JWT + owner permission)
 */
router.post(
  "/:id/collaborators",
  AuthMiddleware,
  canManageCollaborators,
  validate(addCollaboratorSchema),
  noteControllers.addCollaboratorToNote
);

/**
 * @route   GET /notes/:id/collaborators
 * @desc    Retrieve all collaborators associated with a specific note
 * @access  Private (requires JWT + view permission)
 */
router.get(
  "/:id/collaborators",
  AuthMiddleware,
  canViewNote,
  noteControllers.getAllCollaborators
);

/**
 * @route   PATCH /notes/:id/collaborators/:collabId
 * @desc    Update a collaborator's role for a specific note
 * @access  Private (requires JWT + owner permission)
 */
router.patch(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  canManageCollaborators,
  validate(updateCollaboratorSchema),
  noteControllers.updateCollaborator
);

/**
 * @route   DELETE /notes/:id/collaborators/:collabId
 * @desc    Remove a collaborator from a specific note
 * @access  Private (requires JWT + owner permission)
 */
router.delete(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  canManageCollaborators,
  noteControllers.deleteCollaborator
);

export default router;
