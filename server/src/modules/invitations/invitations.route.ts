import express from "express";
import { AuthMiddleware } from "@/middleware/authMiddleware";
import { canManageCollaborators } from "@/middleware/permissions.middleware";
import * as invitationsControllers from "./invitations.controller";

const router = express.Router();

/**
 * @route   POST /invitations/send
 * @desc    Send an invitation to collaborate on a note
 * @access  Private (requires owner permission)
 */
router.post("/send", AuthMiddleware, invitationsControllers.sendInvite);

/**
 * @route   GET /invitations/note/:id
 * @desc    Get all invitations for a note
 * @access  Private (requires owner permission)
 */
router.get(
  "/note/:id",
  AuthMiddleware,
  canManageCollaborators,
  invitationsControllers.getInvitations
);

/**
 * @route   POST /invitations/accept/:token
 * @desc    Accept an invitation
 * @access  Private (must be logged in)
 */
router.post("/accept/:token", AuthMiddleware, invitationsControllers.acceptInvite);

/**
 * @route   DELETE /invitations/:id
 * @desc    Revoke an invitation
 * @access  Private (requires owner permission)
 */
router.delete("/:id", AuthMiddleware, invitationsControllers.revokeInvite);

export default router;
