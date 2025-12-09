import express from "express";
import { AuthMiddleware } from "@/middleware/authMiddleware";
import { canViewNote } from "@/middleware/permissions.middleware";
import * as auditControllers from "./audit.controller";

const router = express.Router();

/**
 * @route   GET /audit/note/:id
 * @desc    Get audit logs for a specific note
 * @access  Private (requires view permission)
 */
router.get(
  "/note/:id",
  AuthMiddleware,
  canViewNote,
  auditControllers.getNoteAudit
);

/**
 * @route   GET /audit/my-activity
 * @desc    Get audit logs for the authenticated user
 * @access  Private
 */
router.get("/my-activity", AuthMiddleware, auditControllers.getMyAuditLogs);

export default router;
