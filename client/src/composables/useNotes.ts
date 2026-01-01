import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { notesApi, type CreateNoteData, type UpdateNoteData } from '@/services/api/notes.api';
import { useToast } from './useToast';
import { getErrorMessage } from '@/lib/helper';
import { ref, computed } from 'vue';

// Query keys for cache management
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...noteKeys.lists(), { page, limit }] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: number) => [...noteKeys.details(), id] as const,
};

/**
 * Fetch all notes with pagination
 */
export function useNotes(page = ref(1), limit = ref(10)) {
  return useQuery({
    queryKey: computed(() => noteKeys.list(page.value, limit.value)),
    queryFn: () => notesApi.getAll(page.value, limit.value),
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
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.id) });
      toast.success('Note updated', 'Your changes have been saved');
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
