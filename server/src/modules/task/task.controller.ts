import { Request, Response, NextFunction } from "express";
import {
  addCollaboratorService,
  createUserTask,
  deleteUserTask,
  findTaskById,
  getCollaboratorsService,
  getUserTasks,
  getUserTasksByStatus,
  removeCollaboratorService,
  updateTaskStatus,
  updateUserTask,
} from "./task.services";

export const CreateTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description } = req.body;
    const ownerId = Number(req.userId);
    if (!title) {
      return res.status(400).json({ error: "Title  are required" });
    }
    if (!description) {
      return res.status(400).json({ error: "Description  are required" });
    }
    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const note = await createUserTask({ title, description, ownerId });

    return res.status(201).json({
      message: "Task created successfully",
      note,
    });
  } catch (err) {
    next(err);
  }
};

export const GetAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = Number(req.userId);
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    const tasks = await getUserTasks(ownerId);
    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = await findTaskById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);
    const { title, description, status } = req.body;
    const ownerId = Number(req.userId);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const updatedTask = await updateUserTask(taskId, ownerId, {
      title,
      description,
      status,
    });

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);
    const ownerId = Number(req.userId);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    await deleteUserTask(taskId, ownerId);

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = Number(req.userId);
    const { status } = req.params;

    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status.toUpperCase())) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: TODO, IN_PROGRESS, DONE",
      });
    }

    const tasks = await getUserTasksByStatus(ownerId, status.toUpperCase());
    return res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatusOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = Number(req.userId);

    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status?.toUpperCase())) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: TODO, IN_PROGRESS, DONE",
      });
    }

    const updatedTask = await updateTaskStatus(
      Number(id),
      ownerId,
      status.toUpperCase()
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    next(err);
  }
};

export const addCollaboratorToTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);
    const ownerId = Number(req.userId);
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const collaborator = await addCollaboratorService(
      taskId,
      ownerId,
      userId,
      role
    );

    return res.status(201).json({
      message: "Collaborator added successfully",
      collaborator,
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskCollaborators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);
    const ownerId = Number(req.userId);

    const collaborators = await getCollaboratorsService(taskId, ownerId);

    return res.status(200).json(collaborators);
  } catch (err) {
    next(err);
  }
};

export const removeCollaboratorFromTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);
    const collabId = Number(req.params.collabId);
    const ownerId = Number(req.userId);

    await removeCollaboratorService(taskId, ownerId, collabId);

    return res.status(200).json({
      message: "Collaborator removed successfully",
    });
  } catch (err) {
    next(err);
  }
};
