import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";

// Sanitize request body to remove sensitive data
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== "object") return body;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "refreshToken", "secret"];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request
  const requestInfo = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.userId || "anonymous",
  };

  logger.info(`Incoming request: ${req.method} ${req.url}`, requestInfo);

  // Log request body for non-GET requests (sanitized)
  if (req.method !== "GET" && Object.keys(req.body || {}).length > 0) {
    logger.debug("Request body", { body: sanitizeBody(req.body) });
  }

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    const duration = Date.now() - startTime;

    // Log response
    const responseInfo = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId || "anonymous",
    };

    if (res.statusCode >= 500) {
      logger.error(`Request failed: ${req.method} ${req.url}`, responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn(`Request error: ${req.method} ${req.url}`, responseInfo);
    } else {
      logger.info(`Request completed: ${req.method} ${req.url}`, responseInfo);
    }

    // Call the original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};
