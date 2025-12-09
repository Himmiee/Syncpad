import prisma from "@/config/db";
import { AuditAction } from "@/generated/prisma";
import { Request } from "express";

export interface AuditLogData {
  action: AuditAction;
  entityType: string;
  entityId: number;
  userId: number;
  noteId?: number;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 * @param data - Audit log data including action, entity info, user ID, and metadata
 * @returns Created audit log entry
 */
export const createAuditLog = async (data: AuditLogData) => {
  return await prisma.auditLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      noteId: data.noteId,
      changes: data.changes,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
};

/**
 * Get audit logs for a specific entity
 * @param entityType - Type of entity (e.g., 'note', 'task')
 * @param entityId - ID of the entity
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Array of audit logs with user details
 */
export const getEntityAuditLogs = async (
  entityType: string,
  entityId: number,
  limit: number = 50
) => {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

/**
 * Get audit logs for a note
 * @param noteId - ID of the note
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Array of audit logs with user details
 */
export const getNoteAuditLogs = async (noteId: number, limit: number = 50) => {
  return await prisma.auditLog.findMany({
    where: {
      noteId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

/**
 * Get audit logs for a user's activity
 * @param userId - ID of the user
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of audit logs with associated note details
 */
export const getUserAuditLogs = async (userId: number, limit: number = 100) => {
  return await prisma.auditLog.findMany({
    where: {
      userId,
    },
    include: {
      note: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

/**
 * Helper to extract request metadata for audit logging
 * @param req - Express request object
 * @returns Object containing IP address and user agent
 */
export const getRequestMetadata = (req: Request) => {
  return {
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
  };
};
