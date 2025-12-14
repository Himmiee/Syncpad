import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { logger } from "@/utils/logger";
import { AppError } from "@/utils/error-classes";

export const ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  logger.error("Error occurred:", {
    method: req.method,
    url: req.url,
    userId: req.userId || "anonymous",
    ip: req.ip,
    userAgent: req.get("user-agent"),
    error: err.message,
    stack: err.stack,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        statusCode: 400,
        details: errors,
      },
    });
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "A record with this value already exists",
          statusCode: 409,
        },
      });
    }

    // Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Record not found",
          statusCode: 404,
        },
      });
    }

    // Foreign key constraint failed
    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REFERENCE",
          message: "Invalid reference to related record",
          statusCode: 400,
        },
      });
    }
  }

  // Default error response for unexpected errors
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" 
        ? "An unexpected error occurred" 
        : err.message,
      statusCode,
    },
  });
};
