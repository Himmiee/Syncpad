import express from "express";
import * as noteControllers from "./notes.controller";
import { AuthMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

// Get all notes
router.get("/all", AuthMiddleware, noteControllers.GetNotes);

// Create a new note
router.post("/create", AuthMiddleware, noteControllers.CreateNotes);

// Get note by ID
router.get("/detail/:id", AuthMiddleware, noteControllers.GetNoteById);

// Update note by ID
router.patch("/update/:id", AuthMiddleware, noteControllers.UpdateNoteById);

// Delete note by ID
router.delete("/delete/:id", AuthMiddleware, noteControllers.DeleteNoteById);

// POST /:id/collaborators
router.post(
  "/:id/collaborators",
  AuthMiddleware,
  noteControllers.addCollaboratorToNote
);

// GET /:id/collaborators
router.get(
  "/:id/collaborators",
  AuthMiddleware,
  noteControllers.getAllCollaborators
);

// PATCH /:id/collaborators/:collabId
router.patch(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  noteControllers.updateCollaborator
);

// DELETE /:id/collaborators/:collabId
router.delete(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  noteControllers.deleteCollaborator
);
export default router;
