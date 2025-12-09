import express from "express";
import { AuthMiddleware } from "@/middleware/authMiddleware";
import { canViewNote, canEditNote } from "@/middleware/permissions.middleware";
import * as versionsControllers from "./versions.controller";

const router = express.Router();

/**
 * @route   GET /versions/note/:id
 * @desc    Get all versions of a note
 * @access  Private (requires view permission)
 */
router.get(
  "/note/:id",
  AuthMiddleware,
  canViewNote,
  versionsControllers.getVersions
);

/**
 * @route   GET /versions/note/:id/:version
 * @desc    Get a specific version of a note
 * @access  Private (requires view permission)
 */
router.get(
  "/note/:id/:version",
  AuthMiddleware,
  canViewNote,
  versionsControllers.getVersion
);

/**
 * @route   POST /versions/note/:id/restore/:version
 * @desc    Restore a note to a specific version
 * @access  Private (requires edit permission)
 */
router.post(
  "/note/:id/restore/:version",
  AuthMiddleware,
  canEditNote,
  versionsControllers.restoreVersion
);

export default router;
