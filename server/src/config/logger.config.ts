import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logLevel = process.env.LOG_LEVEL || "info";
const isProduction = process.env.NODE_ENV === "production";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: isProduction ? logFormat : consoleFormat,
  })
);

// File transports for production
if (isProduction) {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "30d",
      maxSize: "20m",
      format: logFormat,
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      format: logFormat,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
