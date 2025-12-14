import express from "express";
import * as userControllers from "./user.controller";
import { upload } from "@/config/upload";
import { AuthMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

/**
 * @route   POST /users/register
 * @desc    Register a new user (with optional avatar upload)
 * @access  Public
 */
router.post("/register", upload.single("avatar"), userControllers.CreateUser);

/**
 * @route   POST /users/login
 * @desc    Authenticate a user and issue access + refresh tokens
 * @access  Public
 */
router.post("/login", userControllers.LoginUser);

/**
 * @route   GET /users
 * @desc    Retrieve a list of all registered users
 * @access  Public (optional: can be restricted later for admin use)
 */
router.get("/", userControllers.ListUsers);

/**
 * @route   POST /users/refresh
 * @desc    Refresh the user’s access token using a valid refresh token
 * @access  Public
 */
router.post("/refresh", userControllers.RefreshToken);

/**
 * @route   GET /users/me
 * @desc    Get current logged-in user details
 * @access  Private
 */
router.get("/me", AuthMiddleware, userControllers.GetCurrentUser);

export default router;
