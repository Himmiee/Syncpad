import express from "express";
import * as userControllers from "./user.controller";
import { upload } from "@/config/upload";

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

export default router;
