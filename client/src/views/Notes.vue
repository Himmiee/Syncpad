<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import { Plus, FileText, Search, Loader } from 'lucide-vue-next';
import { useNotes } from '@/composables/useNotes';
import NoteCard from '@/components/notes/NoteCard.vue';
import NotePreview from '@/components/notes/NotePreview.vue';
import NoteEditor from '@/components/notes/NoteEditor.vue';
import DeleteNoteModal from '@/components/notes/DeleteNoteModal.vue';
import type { Note } from '@/services/api/notes.api';

// State
const searchQuery = ref('');
const selectedNote = ref<Note | null>(null);
const isEditorOpen = ref(false);
const editingNote = ref<Note | null>(null);
const isDeleteModalOpen = ref(false);
const noteToDelete = ref<Note | null>(null);

// Pagination
const page = ref(1);
const limit = ref(20);

// Fetch notes
const { data, isLoading, isError, error } = useNotes(page, limit);

// Computed
const notes = computed(() => data.value?.data || []);
const pagination = computed(() => data.value?.pagination);

// Filter notes by search query
const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) return notes.value;
  const query = searchQuery.value.toLowerCase();
  return notes.value.filter(
    (note) =>
      note.title.toLowerCase().includes(query) ||
      (typeof note.content === 'string' && note.content.toLowerCase().includes(query))
  );
});

// Handlers
const handleSelectNote = (note: Note) => {
  selectedNote.value = note;
};

const handleCreateNote = () => {
  editingNote.value = null;
  isEditorOpen.value = true;
};

const handleEditNote = (note: Note) => {
  editingNote.value = note;
  isEditorOpen.value = true;
};

const handleDeleteNote = (note: Note) => {
  noteToDelete.value = note;
  isDeleteModalOpen.value = true;
};

const handleEditorClose = () => {
  isEditorOpen.value = false;
  editingNote.value = null;
};

const handleNoteSaved = () => {
  // Clear selection if editing
  if (editingNote.value && selectedNote.value?.id === editingNote.value.id) {
    selectedNote.value = null;
  }
};

const handleNoteDeleted = () => {
  // Clear selection if deleted note was selected
  if (noteToDelete.value && selectedNote.value?.id === noteToDelete.value.id) {
    selectedNote.value = null;
  }
  noteToDelete.value = null;
};

const handleCloseDelete = () => {
  isDeleteModalOpen.value = false;
  noteToDelete.value = null;
};

const handleClosePreview = () => {
  selectedNote.value = null;
};
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-full bg-white text-black lg:overflow-hidden">
    <!-- Main Content Area -->
    <div class="w-full lg:w-2/3 p-6 lg:p-8 flex flex-col border-gray-200 overflow-y-auto">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2">
          Notes
        </h1>
        <p class="text-gray-500">Create and manage your notes</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          variant="default"
          size="lg"
          class="w-full sm:w-auto flex items-center justify-center"
          @click="handleCreateNote"
        >
          <Plus class="w-5 h-5 mr-2" /> Add New Note
        </Button>
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Recent Notes</h2>
          <span v-if="pagination" class="text-sm text-gray-500">
            {{ pagination.total }} note{{ pagination.total !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <Loader class="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p class="text-gray-500">Loading notes...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="flex items-center justify-center h-64">
          <div class="text-center max-w-md">
            <div class="mb-4 flex justify-center">
              <div class="p-4 bg-red-100 rounded-full">
                <FileText class="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-red-600">Error loading notes</h3>
            <p class="text-gray-500">{{ error?.message || 'Something went wrong' }}</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotes.length === 0" class="flex items-center justify-center h-64">
          <div class="text-center max-w-md">
            <div class="mb-4 flex justify-center">
              <div class="p-4 bg-primary/10 rounded-full">
                <FileText class="w-12 h-12 text-primary" />
              </div>
            </div>
            <h3 class="text-xl font-semibold mb-2">
              {{ searchQuery ? 'No notes found' : 'No notes yet' }}
            </h3>
            <p class="text-gray-500">
              {{ searchQuery 
                ? 'Try adjusting your search query' 
                : 'Start creating notes to organize your thoughts and ideas' 
              }}
            </p>
          </div>
        </div>

        <!-- Notes Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NoteCard
            v-for="note in filteredNotes"
            :key="note.id"
            :note="note"
            :is-selected="selectedNote?.id === note.id"
            @select="handleSelectNote"
            @edit="handleEditNote"
            @delete="handleDeleteNote"
          />
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div
      class="w-full lg:w-1/3 mt-6 lg:mt-0 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col"
    >
      <NotePreview
        :note="selectedNote"
        @close="handleClosePreview"
        @edit="handleEditNote"
      />
    </div>

    <!-- Note Editor Drawer -->
    <NoteEditor
      :is-open="isEditorOpen"
      :note="editingNote"
      @close="handleEditorClose"
      @saved="handleNoteSaved"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteNoteModal
      :is-open="isDeleteModalOpen"
      :note="noteToDelete"
      @close="handleCloseDelete"
      @deleted="handleNoteDeleted"
    />
  </div>
</template>
