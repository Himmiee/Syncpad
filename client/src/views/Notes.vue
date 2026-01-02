<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';
import Button from '@/components/ui/button/Button.vue';
import { Plus, Search, Loader, FileText, Inbox } from 'lucide-vue-next';
import { useNotes, useCreateNote } from '@/composables/useNotes';
import NoteListItem from '@/components/notes/NoteListItem.vue';
import type { Note } from '@/services/api/notes.api';

const router = useRouter();
const route = useRoute();

// State
const searchQuery = ref('');
const page = ref(1);
const limit = ref(20);

// Fetch notes
const { data, isLoading, isError, error } = useNotes(page, limit, searchQuery);
const { mutate: createNote, isPending: isCreating } = useCreateNote();

// Computed
const notes = computed(() => data.value?.data || []);
const selectedNoteId = computed(() => Number(route.params.id));

// Handlers
const handleSelectNote = (note: Note) => {
  router.push(`/dashboard/notes/${note.id}`);
};

const handleCreateNote = () => {
  createNote(
    { 
      title: 'Untitled Note', 
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph'
          }
        ]
      }
    },
    {
      onSuccess: ({ note }) => {
        router.push(`/dashboard/notes/${note.id}`);
      },
    }
  );
};

</script>

<template>
  <div class="flex h-full bg-white overflow-hidden">
    <!-- Left Pane: Notes List -->
    <!-- Hidden on mobile if viewing a specific note -->
    <div 
      class="w-full lg:w-80 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white"
      :class="{ 'hidden lg:flex': selectedNoteId }"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-100 space-y-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-900">Notes</h1>
          <Button
            size="sm"
            class="h-8 w-8 p-0 rounded-full"
            @click="handleCreateNote"
            :disabled="isCreating"
          >
            <Plus class="w-5 h-5" />
          </Button>
        </div>

        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes..."
            class="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
        </div>
      </div>

      <!-- Notes List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader class="w-6 h-6 animate-spin mb-2" />
          <span class="text-xs">Loading...</span>
        </div>

        <!-- Error -->
        <div v-else-if="isError" class="p-6 text-center">
          <p class="text-sm text-red-500 mb-2">Failed to load notes</p>
          <p class="text-xs text-gray-400">{{ error?.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="notes.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 px-6 text-center">
          <div class="p-3 bg-gray-50 rounded-full mb-3">
            <Inbox class="w-6 h-6 text-gray-300" />
          </div>
          <p class="text-sm font-medium text-gray-900 mb-1">No notes yet</p>
          <p class="text-xs text-gray-500">Create a note to get started</p>
        </div>

        <!-- List -->
        <div v-else class="divide-y divide-gray-50">
          <NoteListItem
            v-for="note in notes"
            :key="note.id"
            :note="note"
            :is-selected="selectedNoteId === note.id"
            @select="handleSelectNote"
          />
        </div>
      </div>
    </div>

    <!-- Right Pane: Editor / Empty State -->
    <!-- Hidden on mobile if NOT viewing a note -->
    <div 
      class="flex-1 flex flex-col h-full bg-white overflow-hidden relative"
      :class="{ 'hidden lg:flex': !selectedNoteId }"
    >
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <component :is="Component" :key="$route.path" />
        </template>
        
        <!-- Empty Selection State (Desktop only) -->
        <template v-else>
          <div class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
              <FileText class="w-8 h-8 text-gray-300" />
            </div>
            <h2 class="text-lg font-medium text-gray-900 mb-2">Select a note to view</h2>
            <p class="text-sm text-gray-500 max-w-xs text-center">
              Choose a note from the list on the left, or create a new one to get started.
            </p>
          </div>
        </template>
      </RouterView>
    </div>
  </div>
</template>
