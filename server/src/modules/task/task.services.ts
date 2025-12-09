import prisma from "@/config/db";
import { CollaboratorRole, TaskStatus } from "@/generated/prisma";
import { Task } from "@/types/notes";

/**
 * Create a new task for a user
 * @param data - Task data including title, description, and ownerId
 * @returns Created task
 * @throws Error if user ID is invalid
 */
export const createUserTask = async (data: Task) => {
  const user = await prisma.user.findUnique({
    where: { id: data.ownerId },
  });
  if (!user) throw new Error("User Id not valid");

  return await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      ownerId: data.ownerId,
    },
  });
};

/**
 * Get all tasks for a user
 * @param ownerId - ID of the task owner
 * @returns Array of tasks ordered by creation date
 */
export const getUserTasks = async (ownerId: number) => {
  return await prisma.task.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Find a task by ID with owner and collaborators
 * @param id - Task ID
 * @returns Task with owner and collaborator details or null
 */
export const findTaskById = async (id: number) => {
  return await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      collaborators: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          role: true,
        },
      },
    },
  });
};

/**
 * Update a task (title, description, or status)
 * @param taskId - ID of the task to update
 * @param ownerId - ID of the task owner
 * @param data - Fields to update
 * @returns Updated task
 * @throws Error if task not found or unauthorized
 */
export const updateUserTask = async (
  taskId: number,
  ownerId: number,
  data: { title?: string; description?: string; status?: TaskStatus }
) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) throw new Error("Task not found");
  if (task.ownerId !== ownerId) throw new Error("Unauthorized");

  return await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
    },
  });
};

/**
 * Delete a task
 * @param taskId - ID of the task to delete
 * @param ownerId - ID of the task owner
 * @throws Error if task not found or unauthorized
 */
export const deleteUserTask = async (taskId: number, ownerId: number) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) throw new Error("Task not found");
  if (task.ownerId !== ownerId) throw new Error("Unauthorized");

  await prisma.task.delete({ where: { id: taskId } });
};

/**
 * Get user tasks filtered by status
 * @param ownerId - ID of the task owner
 * @param status - Task status (TODO, IN_PROGRESS, DONE)
 * @returns Array of tasks with the specified status
 */
export const getUserTasksByStatus = async (ownerId: number, status: string) => {
  return await prisma.task.findMany({
    where: {
      ownerId,
      status: status as any,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Update task status only
 * @param taskId - ID of the task
 * @param ownerId - ID of the task owner
 * @param status - New status
 * @returns Updated task or null if not found
 */
export const updateTaskStatus = async (
  taskId: number,
  ownerId: number,
  status: string
) => {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, ownerId },
  });
  if (!existing) return null;

  return await prisma.task.update({
    where: { id: taskId },
    data: { status: status as any },
  });
};

/**
 * Add a collaborator to a task
 * @param taskId - ID of the task
 * @param ownerId - ID of the task owner
 * @param userId - ID of the user to add as collaborator
 * @param role - Collaborator role (VIEWER or EDITOR)
 * @returns Created collaborator with user details
 * @throws Error if unauthorized, task not found, or collaborator already exists
 */
export const addCollaboratorService = async (
  taskId: number,
  ownerId: number,
  userId: number,
  role: CollaboratorRole = "VIEWER"
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { collaborators: true },
  });

  if (!task || task.ownerId !== ownerId) {
    throw new Error("Unauthorized or task not found");
  }

  const existing = await prisma.collaborator.findFirst({
    where: { taskId, userId },
  });

  if (existing) {
    throw new Error("Collaborator already added");
  }

  // Create collaborator
  return await prisma.collaborator.create({
    data: {
      taskId,
      userId,
      role,
    },
    include: {
      user: { select: { id: true, username: true, email: true } },
    },
  });
};

/**
 * Get all collaborators for a task
 * @param taskId - ID of the task
 * @param ownerId - ID of the requesting user
 * @returns Array of collaborators with user details
 * @throws Error if task not found or unauthorized
 */
export const getCollaboratorsService = async (
  taskId: number,
  ownerId: number
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { collaborators: { include: { user: true } } },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Allow access if user is owner or collaborator
  const isOwner = task.ownerId === ownerId;
  const isCollaborator = task.collaborators.some((c) => c.userId === ownerId);

  if (!isOwner && !isCollaborator) {
    throw new Error("Unauthorized to view collaborators");
  }

  return task.collaborators.map((c) => ({
    id: c.id,
    role: c.role,
    user: {
      id: c.user.id,
      username: c.user.username,
      email: c.user.email,
    },
  }));
};

/**
 * Remove a collaborator from a task
 * @param taskId - ID of the task
 * @param ownerId - ID of the task owner
 * @param collabId - ID of the collaborator to remove
 * @returns True if successful
 * @throws Error if unauthorized, task not found, or collaborator not found
 */
export const removeCollaboratorService = async (
  taskId: number,
  ownerId: number,
  collabId: number
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.ownerId !== ownerId) {
    throw new Error("Unauthorized or task not found");
  }

  // Delete collaborator
  const deleted = await prisma.collaborator.deleteMany({
    where: { id: collabId, taskId },
  });

  if (deleted.count === 0) {
    throw new Error("Collaborator not found or already removed");
  }

  return true;
};
