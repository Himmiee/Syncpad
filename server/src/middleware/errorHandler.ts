import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

const isDevelopment = process.env.NODE_ENV !== "production";

export const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error with full context
  const errorContext = {
    method: req.method,
    url: req.url,
    userId: req.userId || "anonymous",
    ip: req.ip,
    userAgent: req.get("user-agent"),
    error: err.message,
    stack: err.stack,
  };

  logger.error(`Error occurred: ${err.message}`, errorContext);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    let message = "Database error";
    let statusCode = 500;

    // Handle specific Prisma error codes
    switch (err.code) {
      case "P2002":
        message = "A record with this value already exists";
        statusCode = 409;
        break;
      case "P2025":
        message = "Record not found";
        statusCode = 404;
        break;
      case "P2003":
        message = "Foreign key constraint failed";
        statusCode = 400;
        break;
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(isDevelopment && { details: err.message }),
    });
  }

  // Handle custom errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message || "An error occurred",
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  // Generic error handler
  res.status(500).json({
    success: false,
    error: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
};
