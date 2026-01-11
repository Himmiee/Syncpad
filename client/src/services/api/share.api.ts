import api from '@/lib/axios';

// Types
export interface ShareLink {
  id: number;
  token: string;
  noteId: number;
  permission: 'VIEW' | 'EDIT';
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  createdById: number;
}

export interface SharedNoteResponse {
  note: {
    id: number;
    title: string;
    content: any;
    updatedAt: string;
    owner: {
      id: number;
      username: string;
    };
  };
  permission: 'VIEW' | 'EDIT';
  canEdit: boolean;
}

export interface CreateShareLinkData {
  permission?: 'VIEW' | 'EDIT';
  expiresInDays?: number;
}

// API Functions
export const shareApi = {
  /**
   * Create a shareable link for a note
   */
  createLink: async (
    noteId: number,
    data: CreateShareLinkData = {}
  ): Promise<{ message: string; shareLink: ShareLink; url: string }> => {
    const response = await api.post(`/share/note/${noteId}/link`, {
      permission: data.permission || 'VIEW',
      expiresInDays: data.expiresInDays,
    });
    return response.data;
  },

  /**
   * Get all share links for a note
   */
  getLinks: async (noteId: number): Promise<{ message: string; links: ShareLink[] }> => {
    const response = await api.get(`/share/note/${noteId}/links`);
    return response.data;
  },

  /**
   * Update a share link
   */
  updateLink: async (
    token: string,
    data: { isActive?: boolean; permission?: 'VIEW' | 'EDIT' }
  ): Promise<{ message: string; shareLink: ShareLink }> => {
    const response = await api.patch(`/share/link/${token}`, data);
    return response.data;
  },

  /**
   * Delete/revoke a share link
   */
  deleteLink: async (token: string): Promise<{ message: string }> => {
    const response = await api.delete(`/share/link/${token}`);
    return response.data;
  },

  /**
   * Access a shared note (public endpoint - no auth required)
   */
  getSharedNote: async (token: string): Promise<SharedNoteResponse> => {
    const response = await api.get(`/share/public/${token}`);
    return response.data;
  },
};
