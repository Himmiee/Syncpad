import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query';
import { notesApi, type CreateNoteData, type UpdateNoteData } from '@/services/api/notes.api';
import { useToast } from './useToast';
import { getErrorMessage } from '@/lib/helper';
import { ref, computed } from 'vue';

// Query keys for cache management
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (page: number, limit: number, search?: string) => [...noteKeys.lists(), { page, limit, search }] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: number) => [...noteKeys.details(), id] as const,
  collaborators: (id: number) => [...noteKeys.detail(id), 'collaborators'] as const,
};

// ... existing useNotes, useNote, etc ...


/**
 * Fetch all notes with pagination and search
 */
export function useNotes(page = ref(1), limit = ref(10), search = ref('')) {
  return useQuery({
    queryKey: computed(() => noteKeys.list(page.value, limit.value, search.value)),
    queryFn: () => notesApi.getAll(page.value, limit.value, search.value),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
  });
}

/**
 * Fetch a single note by ID
 */
export function useNote(id: number) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Create a new note
 */
export function useCreateNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateNoteData) => notesApi.create(data),
    onSuccess: (data) => {
      // Invalidate notes list to refetch
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Note created', `"${data.note.title}" has been created`);
    },
    onError: (error: any) => {
      toast.error('Failed to create note', getErrorMessage(error, 'Please try again'));
    },
  });
}

/**
 * Update an existing note
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNoteData }) =>
      notesApi.update(id, data),
    onSuccess: (_, variables: any) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.id) });
      
      // Only show toast if not silent
      if (!variables.silent) {
        toast.success('Note updated', 'Your changes have been saved');
      }
    },
    onError: (error: any) => {
      toast.error('Failed to update note', getErrorMessage(error, 'Please try again'));
    },
  });
}

/**
 * Delete a note
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => {
      // Invalidate notes list
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Note deleted', 'The note has been removed');
    },
    onError: (error: any) => {
      toast.error('Failed to delete note', getErrorMessage(error, 'Please try again'));
    },
  });
}

/**
 * Fetch collaborators for a note
 */
export function useCollaborators(noteId: number) {
  return useQuery({
    queryKey: noteKeys.collaborators(noteId),
    queryFn: () => notesApi.getCollaborators(noteId),
    enabled: !!noteId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Add a collaborator
 */
export function useAddCollaborator() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: number; data: { userId?: number; email?: string; role?: 'VIEWER' | 'EDITOR' } }) =>
      notesApi.addCollaborator(noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.collaborators(variables.noteId) });
      toast.success('Collaborator added', 'User has been invited to the note');
    },
    onError: (error: any) => {
      toast.error('Failed to add collaborator', getErrorMessage(error, 'Please try again'));
    },
  });
}

/**
 * Update a collaborator
 */
export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ noteId, collabId, role }: { noteId: number; collabId: number; role: 'VIEWER' | 'EDITOR' }) =>
      notesApi.updateCollaborator(noteId, collabId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.collaborators(variables.noteId) });
      toast.success('Role updated', 'Collaborator permissions have been updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update role', getErrorMessage(error, 'Please try again'));
    },
  });
}

/**
 * Remove a collaborator
 */
export function useRemoveCollaborator() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ noteId, collabId }: { noteId: number; collabId: number }) =>
      notesApi.removeCollaborator(noteId, collabId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.collaborators(variables.noteId) });
      toast.success('Collaborator removed', 'User no longer has access to this note');
    },
    onError: (error: any) => {
      toast.error('Failed to remove collaborator', getErrorMessage(error, 'Please try again'));
    },
  });
}


/**
 * Request edit access
 */
export function useRequestEditAccess() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ noteId, message }: { noteId: number; message?: string }) =>
      notesApi.requestEditAccess(noteId, message),
    onSuccess: (_, variables) => {
      // Invalidate collaborators
      queryClient.invalidateQueries({ queryKey: noteKeys.collaborators(variables.noteId) });
      // Also detail, as current user permission might rely on it (though role doesn't change yet)
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.noteId) });
      toast.success('Access requested', 'Owner has been notified');
    },
    onError: (error: any) => {
      toast.error('Failed to request access', getErrorMessage(error, 'Please try again'));
    },
  });
}

/**
 * Deny edit access
 */
export function useDenyEditAccess() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ noteId, collabId }: { noteId: number; collabId: number }) =>
      notesApi.denyEditAccess(noteId, collabId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.collaborators(variables.noteId) });
      toast.success('Request denied', 'Collaborator request has been denied');
    },
    onError: (error: any) => {
      toast.error('Failed to deny request', getErrorMessage(error, 'Please try again'));
    },
  });
}
