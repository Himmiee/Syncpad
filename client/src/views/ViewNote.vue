<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  ArrowLeft,
  Save,
  Loader,
  Share2,
  Users,
  History,
  Trash2,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Code,
  Quote,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useNote, useUpdateNote } from '@/composables/useNotes';
import DeleteNoteModal from '@/components/notes/DeleteNoteModal.vue';

const route = useRoute();
const router = useRouter();

// Get note ID from route
const noteId = computed(() => Number(route.params.id));

// Fetch note
const { data, isLoading, isError, error } = useNote(noteId.value);

const note = computed(() => data.value?.note);

// Form state
const title = ref('');
const hasUnsavedChanges = ref(false);

// Delete modal state
const isDeleteModalOpen = ref(false);

// Mutations
const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();

// TipTap Editor
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Start writing your note...',
    }),
  ],
  content: '',
  onUpdate: () => {
    hasUnsavedChanges.value = true;
  },
});

// Watch for note data and update form
watch(
  () => note.value,
  (noteData) => {
    if (noteData && editor.value) {
      title.value = noteData.title;
      editor.value.commands.setContent(noteData.content || '');
      hasUnsavedChanges.value = false;
    }
  },
  { immediate: true }
);

// Watch title changes
watch(title, () => {
  if (note.value && title.value !== note.value.title) {
    hasUnsavedChanges.value = true;
  }
});

// Navigation guard - warn before leaving with unsaved changes
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    const confirmLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    if (!confirmLeave) {
      next(false);
      return;
    }
  }
  next();
});

// Handlers
const handleBack = () => {
  router.push('/dashboard/notes');
};

const handleSave = () => {
  if (!noteId.value || !editor.value) return;
  
  updateNote(
    {
      id: noteId.value,
      data: {
        title: title.value.trim(),
        content: editor.value.getJSON(),
      },
    },
    {
      onSuccess: () => {
        hasUnsavedChanges.value = false;
      },
    }
  );
};

const handleDelete = () => {
  isDeleteModalOpen.value = true;
};

const handleNoteDeleted = () => {
  router.push('/dashboard/notes');
};

// Toolbar helpers
const isActive = (type: string, attrs?: Record<string, any>) => {
  return editor.value?.isActive(type, attrs) ?? false;
};
</script>

<template>
  <div class="flex flex-col h-full bg-white text-black">
    <!-- Top Bar -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="sm" @click="handleBack">
          <ArrowLeft class="w-4 h-4 mr-2 text-gray-700" />
          <span class="hidden sm:inline text-gray-700">Back</span>
        </Button>
        
        <div v-if="hasUnsavedChanges" class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Unsaved changes
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Action Buttons -->
        <Button variant="ghost" size="sm" class="hidden sm:flex">
          <History class="w-4 h-4 mr-2 text-gray-600" />
          <span class="text-gray-600">Versions</span>
        </Button>
        <Button variant="ghost" size="sm" class="hidden sm:flex">
          <Users class="w-4 h-4 mr-2 text-gray-600" />
          <span class="text-gray-600">Collaborators</span>
        </Button>
        <Button variant="ghost" size="sm" class="hidden sm:flex">
          <Share2 class="w-4 h-4 mr-2 text-gray-600" />
          <span class="text-gray-600">Share</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          class="text-red-600 hover:bg-red-50"
          @click="handleDelete"
        >
          <Trash2 class="w-4 h-4" />
        </Button>
        
        <Button
          variant="default"
          size="sm"
          :disabled="isUpdating || !hasUnsavedChanges"
          @click="handleSave"
        >
          <Loader v-if="isUpdating" class="w-4 h-4 mr-2 animate-spin" />
          <Save v-else class="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Loader class="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p class="text-gray-500">Loading note...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="flex-1 flex items-center justify-center p-6">
      <div class="text-center max-w-md">
        <p class="text-red-500 mb-4">{{ error?.message || 'Failed to load note' }}</p>
        <Button @click="handleBack">Back to Notes</Button>
      </div>
    </div>

    <!-- Note Editor -->
    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- Title Input -->
      <div class="px-4 sm:px-8 pt-6">
        <Input
          v-model="title"
          placeholder="Note title..."
          class="text-2xl font-semibold border-0 border-b border-gray-200 rounded-none px-0 focus:ring-0 text-gray-900 bg-transparent"
        />
      </div>

      <!-- Editor Toolbar -->
      <div
        v-if="editor"
        class="flex flex-wrap items-center gap-1 px-4 sm:px-8 py-3 border-b border-gray-100"
      >
        <div class="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('bold') }"
            @click="editor?.chain().focus().toggleBold().run()"
          >
            <Bold class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('italic') }"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
            <Italic class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('strike') }"
            @click="editor?.chain().focus().toggleStrike().run()"
          >
            <Strikethrough class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('code') }"
            @click="editor?.chain().focus().toggleCode().run()"
          >
            <Code class="w-4 h-4 text-gray-700" />
          </Button>
        </div>

        <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

        <div class="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('heading', { level: 1 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          >
            <Heading1 class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('heading', { level: 2 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            <Heading2 class="w-4 h-4 text-gray-700" />
          </Button>
        </div>

        <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

        <div class="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('bulletList') }"
            @click="editor?.chain().focus().toggleBulletList().run()"
          >
            <List class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('orderedList') }"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          >
            <ListOrdered class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            :class="{ 'bg-gray-200': isActive('blockquote') }"
            @click="editor?.chain().focus().toggleBlockquote().run()"
          >
            <Quote class="w-4 h-4 text-gray-700" />
          </Button>
        </div>

        <div class="w-px h-6 bg-gray-200 mx-1" />

        <div class="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            @click="editor?.chain().focus().undo().run()"
            :disabled="!editor?.can().undo()"
          >
            <Undo class="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            @click="editor?.chain().focus().redo().run()"
            :disabled="!editor?.can().redo()"
          >
            <Redo class="w-4 h-4 text-gray-700" />
          </Button>
        </div>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
        <EditorContent
          :editor="editor"
          class="prose prose-sm max-w-none min-h-[300px] focus:outline-none"
        />
      </div>
    </div>

    <!-- Delete Modal -->
    <DeleteNoteModal
      :is-open="isDeleteModalOpen"
      :note="note || null"
      @close="isDeleteModalOpen = false"
      @deleted="handleNoteDeleted"
    />
  </div>
</template>

<style>
/* TipTap Editor Styles for ViewNote */
.ProseMirror {
  min-height: 300px;
  outline: none;
  color: #111827;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.ProseMirror h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #111827;
}

.ProseMirror h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.ProseMirror p {
  margin-bottom: 0.5rem;
  color: #111827;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror li {
  margin-bottom: 0.25rem;
  color: #111827;
}

.ProseMirror li::marker {
  color: #374151;
}

.ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0;
  color: #6b7280;
}

.ProseMirror code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #111827;
}
</style>
