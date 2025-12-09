import express from "express";
import userRouter from "./modules/user/user.route";
import noteRouter from "./modules/notes/notes.route";
import taskRouter from "./modules/task/task.route";
import auditRouter from "./modules/audit/audit.route";
import versionsRouter from "./modules/versions/versions.route";
import shareRouter from "./modules/share/share.route";
import invitationsRouter from "./modules/invitations/invitations.route";
import { ErrorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.middleware";

export const app = express();

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

app.use("/v1/users", userRouter);
app.use("/v1/notes", noteRouter);
app.use("/v1/tasks", taskRouter);
app.use("/v1/audit", auditRouter);
app.use("/v1/versions", versionsRouter);
app.use("/v1/share", shareRouter);
app.use("/v1/invitations", invitationsRouter);
app.use(ErrorHandler);
