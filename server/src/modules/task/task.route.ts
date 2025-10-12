import express from "express";
import * as taskControllers from "./task.controller";
import { AuthMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

/**
 * @route   POST /tasks/create
 * @desc    Create a new task for the authenticated user
 * @access  Private (requires JWT)
 */
router.post("/create", AuthMiddleware, taskControllers.CreateTasks);

/**
 * @route   GET /tasks/all
 * @desc    Get all tasks belonging to the authenticated user
 * @access  Private (requires JWT)
 */
router.get("/all", AuthMiddleware, taskControllers.GetAllTasks);

/**
 * @route   GET /tasks/:id
 * @desc    Get a single task by its ID (only if owned by the user)
 * @access  Private (requires JWT)
 */
router.get("/:id", AuthMiddleware, taskControllers.getTaskById);

/**
 * @route   PATCH /tasks/:id
 * @desc    Update a task’s title, description, or status
 * @access  Private (requires JWT)
 */
router.patch("/:id", AuthMiddleware, taskControllers.updateTask);

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete a task owned by the authenticated user
 * @access  Private (requires JWT)
 */
router.delete("/:id", AuthMiddleware, taskControllers.deleteTask);

/**
 * @route   GET /tasks/status/:status
 * @desc    Get all tasks filtered by status (TODO, IN_PROGRESS, DONE)
 * @access  Private
 */
router.get("/status/:status", AuthMiddleware, taskControllers.getTasksByStatus);

/**
 * @route   PATCH /tasks/:id/status
 * @desc    Update only the status of a specific task (Kanban-style update)
 * @access  Private
 */
router.patch(
  "/:id/status",
  AuthMiddleware,
  taskControllers.updateTaskStatusOnly
);
/**
 * @route POST /tasks/:id/collaborators
 * @desc Add a collaborator to a specific task (requires task ownership)
 * @access Private
 */
router.post(
  "/:id/collaborators",
  AuthMiddleware,
  taskControllers.addCollaboratorToTask
);

/**
 * @route GET /tasks/:id/collaborators
 * @desc Retrieve all collaborators associated with a specific task
 * @access Private
 */
router.get(
  "/:id/collaborators",
  AuthMiddleware,
  taskControllers.getTaskCollaborators
);

/**
 * @route DELETE /tasks/:id/collaborators/:collabId
 * @desc Remove a collaborator from a specific task (owner only)
 * @access Private
 */
router.delete(
  "/:id/collaborators/:collabId",
  AuthMiddleware,
  taskControllers.removeCollaboratorFromTask
);

export default router;
