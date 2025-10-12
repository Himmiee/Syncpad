import express from "express";
import * as Controllers from "./task";
import { AuthMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

export default router;
