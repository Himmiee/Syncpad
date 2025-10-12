import prisma from "@/config/db";
import { TaskStatus } from "@/generated/prisma";
import { Task } from "@/types/notes";

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

export const deleteUserTask = async (taskId: number, ownerId: number) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) throw new Error("Task not found");
  if (task.ownerId !== ownerId) throw new Error("Unauthorized");

  await prisma.task.delete({ where: { id: taskId } });
};
