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

export default router;
