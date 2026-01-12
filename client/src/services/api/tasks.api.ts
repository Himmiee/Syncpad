import api from '@/lib/axios';

// Enums matching backend
export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const CollaboratorRole = {
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
export type CollaboratorRole = typeof CollaboratorRole[keyof typeof CollaboratorRole];

export interface TaskCollaborator {
  id: number;
  userId: number;
  taskId: number;
  role: CollaboratorRole;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  collaborators?: TaskCollaborator[];
  owner?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TasksResponse {
  message: string;
  tasks: Task[];
  count: number;
}

export interface TaskResponse {
  message: string;
  task: Task;
}

// API functions
export const getTasks = async (): Promise<TasksResponse> => {
  const response = await api.get('/tasks/all');
  return response.data;
};

export const getTask = async (id: number): Promise<TaskResponse> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: CreateTaskData): Promise<TaskResponse> => {
  const response = await api.post('/tasks/create', data);
  return response.data;
};

export const updateTask = async (id: number, data: UpdateTaskData): Promise<TaskResponse> => {
  const response = await api.patch(`/tasks/${id}`, data);
  return response.data;
};

export const updateTaskStatus = async (id: number, status: TaskStatus): Promise<TaskResponse> => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data;
};

export const deleteTask = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

// Collaborators
export const addTaskCollaborator = async (taskId: number, userId: number, role?: CollaboratorRole): Promise<{ message: string; collaborator: TaskCollaborator }> => {
  const response = await api.post(`/tasks/${taskId}/collaborators`, { userId, role });
  return response.data;
};

export const removeTaskCollaborator = async (taskId: number, collaboratorId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/tasks/${taskId}/collaborators/${collaboratorId}`);
  return response.data;
};
