import express from "express";
import { AuthMiddleware } from "@/middleware/authMiddleware";
import { canManageCollaborators } from "@/middleware/permissions.middleware";
import * as shareControllers from "./share.controller";

const router = express.Router();

/**
 * @route   POST /share/note/:id/link
 * @desc    Create a shareable link for a note
 * @access  Private (requires owner permission)
 */
router.post(
  "/note/:id/link",
  AuthMiddleware,
  canManageCollaborators,
  shareControllers.createLink
);

/**
 * @route   GET /share/note/:id/links
 * @desc    Get all share links for a note
 * @access  Private (requires owner permission)
 */
router.get(
  "/note/:id/links",
  AuthMiddleware,
  canManageCollaborators,
  shareControllers.getLinks
);

/**
 * @route   PATCH /share/link/:token
 * @desc    Update a share link
 * @access  Private (requires owner permission)
 */
router.patch("/link/:token", AuthMiddleware, shareControllers.updateLink);

/**
 * @route   DELETE /share/link/:token
 * @desc    Delete/revoke a share link
 * @access  Private (requires owner permission)
 */
router.delete("/link/:token", AuthMiddleware, shareControllers.deleteLink);

/**
 * @route   GET /share/public/:token
 * @desc    Access a shared note (public, no auth required)
 * @access  Public
 */
router.get("/public/:token", shareControllers.accessSharedNote);

export default router;
