import api from '@/lib/axios';

// Types
export interface Note {
  id: number;
  title: string;
  content: any; // JSON content from backend
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  collaborators?: Collaborator[];
}

export interface Collaborator {
  id: number;
  userId: number;
  noteId: number;
  role: 'VIEWER' | 'EDITOR';
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateNoteData {
  title: string;
  content: any;
}

export interface UpdateNoteData {
  title?: string;
  content?: any;
}

export interface PaginatedNotesResponse {
  message: string;
  data: Note[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface NoteResponse {
  message: string;
  note: Note;
}

// API Functions
export const notesApi = {
  /**
   * Get all notes for the current user (paginated)
   */
  getAll: async (page = 1, limit = 10, search?: string): Promise<PaginatedNotesResponse> => {
    const response = await api.get('/notes/all', {
      params: { page, limit, search },
    });
    return response.data;
  },

  /**
   * Get a single note by ID
   */
  getById: async (id: number): Promise<NoteResponse> => {
    const response = await api.get(`/notes/detail/${id}`);
    return response.data;
  },

  /**
   * Create a new note
   */
  create: async (data: CreateNoteData): Promise<NoteResponse> => {
    const response = await api.post('/notes/create', data);
    return response.data;
  },

  /**
   * Update an existing note
   */
  update: async (id: number, data: UpdateNoteData): Promise<NoteResponse> => {
    const response = await api.patch(`/notes/update/${id}`, data);
    return response.data;
  },

  /**
   * Delete a note
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/notes/delete/${id}`);
    return response.data;
  },

  /**
   * Get collaborators for a note
   */
  getCollaborators: async (noteId: number): Promise<{ message: string; collaborators: Collaborator[] }> => {
    const response = await api.get(`/notes/${noteId}/collaborators`);
    return response.data;
  },

  /**
   * Add a collaborator to a note
   */
  addCollaborator: async (
    noteId: number,
    userId: number,
    role: 'VIEWER' | 'EDITOR' = 'VIEWER'
  ): Promise<{ message: string; collaborator: Collaborator }> => {
    const response = await api.post(`/notes/${noteId}/collaborators`, { userId, role });
    return response.data;
  },

  /**
   * Remove a collaborator from a note
   */
  removeCollaborator: async (noteId: number, collabId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/notes/${noteId}/collaborators/${collabId}`);
    return response.data;
  },
};
