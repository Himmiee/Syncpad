import api from '@/lib/axios';

// Types
export interface NoteVersion {
  id: number;
  noteId: number;
  version: number;
  title: string;
  content: any;
  createdAt: string;
  createdBy?: {
    id: number;
    username: string;
  };
}

export interface VersionsResponse {
  message: string;
  versions: NoteVersion[];
}

export interface VersionResponse {
  message: string;
  version: NoteVersion;
}

export interface RestoreResponse {
  message: string;
  note: {
    id: number;
    title: string;
    content: any;
    updatedAt: string;
  };
}

// API Functions
export const versionsApi = {
  /**
   * Get all versions of a note
   */
  getVersions: async (noteId: number): Promise<VersionsResponse> => {
    const response = await api.get(`/versions/note/${noteId}`);
    return response.data;
  },

  /**
   * Get a specific version of a note
   */
  getVersion: async (noteId: number, version: number): Promise<VersionResponse> => {
    const response = await api.get(`/versions/note/${noteId}/${version}`);
    return response.data;
  },

  /**
   * Restore a note to a specific version
   */
  restoreVersion: async (noteId: number, version: number): Promise<RestoreResponse> => {
    const response = await api.post(`/versions/note/${noteId}/restore/${version}`);
    return response.data;
  },
};
