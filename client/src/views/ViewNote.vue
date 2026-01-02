<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
const originalContent = ref<any>(null);
const originalTitle = ref('');

// Delete modal state
const isDeleteModalOpen = ref(false);

// Unsaved changes modal state
const isUnsavedModalOpen = ref(false);
const pendingNavigation = ref<(() => void) | null>(null);

// Mutations
const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();

// Status state
const saveStatus = ref<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
const lastSavedAt = ref<Date | null>(null);

// Debounce timer
let autoSaveTimer: any = null;

const triggerAutoSave = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  saveStatus.value = 'unsaved';
  
  autoSaveTimer = setTimeout(() => {
    handleSave(true); // silent = true
  }, 2000); // Auto-save after 2 seconds
};

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
    triggerAutoSave();
  },
});

const isInitialized = ref(false);

// Watch for note data and update form
watch(
  [() => note.value, editor],
  ([noteData, editorInstance]) => {
    if (noteData && editorInstance && !isInitialized.value) {
      title.value = noteData.title;
      originalTitle.value = noteData.title;
      originalContent.value = noteData.content || '';
      
      // Set content without emitting update to prevent unsaved changes flag
      editorInstance.commands.setContent(noteData.content || '', { emitUpdate: false });
      
      hasUnsavedChanges.value = false;
      saveStatus.value = 'saved';
      lastSavedAt.value = new Date(noteData.updatedAt);
      isInitialized.value = true;
    }
  },
  { immediate: true }
);

// Watch title changes
watch(title, () => {
  // Only mark as unsaved if initialized (prevents initial load triggering it)
  if (isInitialized.value && note.value && title.value !== note.value.title) {
    hasUnsavedChanges.value = true;
    triggerAutoSave();
  }
});

// Navigation guard - show modal before leaving with unsaved changes
onBeforeRouteLeave((_to, _from, next) => {
  if (hasUnsavedChanges.value) {
    isUnsavedModalOpen.value = true;
    pendingNavigation.value = () => {
      hasUnsavedChanges.value = false; // Reset to allow navigation
      next();
    };
    next(false); // Prevent navigation for now
    return;
  }
  next();
});

// Discard changes and continue navigation
const discardChanges = () => {
  // Reset to original values
  if (editor.value && originalContent.value !== null) {
    editor.value.commands.setContent(originalContent.value);
  }
  title.value = originalTitle.value;
  hasUnsavedChanges.value = false;
  isUnsavedModalOpen.value = false;
  
  // Continue with pending navigation
  if (pendingNavigation.value) {
    pendingNavigation.value();
    pendingNavigation.value = null;
  }
};

// Cancel leaving - stay on page
const cancelLeave = () => {
  isUnsavedModalOpen.value = false;
  pendingNavigation.value = null;
};

// Handlers
const handleBack = () => {
  router.push('/dashboard/notes');
};

const handleSave = (silent = false) => {
  if (!noteId.value || !editor.value) return;
  
  if (silent) saveStatus.value = 'saving';
  
  updateNote(
    {
      id: noteId.value,
      data: {
        title: title.value.trim(),
        content: editor.value.getJSON(),
      },
      // @ts-ignore
      silent,
    },
    {
      onSuccess: () => {
        hasUnsavedChanges.value = false;
        // Update originals after save
        originalTitle.value = title.value.trim();
        originalContent.value = editor.value?.getJSON();
        
        saveStatus.value = 'saved';
        lastSavedAt.value = new Date();
      },
      onError: () => {
        saveStatus.value = 'error';
      }
    }
  );
};

const handleDelete = () => {
  isDeleteModalOpen.value = true;
};

const handleNoteDeleted = () => {
  hasUnsavedChanges.value = false; // Prevent unsaved modal on delete
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
        <Button variant="ghost" size="sm" @click="handleBack" class="lg:hidden">
          <ArrowLeft class="w-4 h-4 mr-2 text-gray-700" />
          <span class="hidden sm:inline text-gray-700">Back</span>
        </Button>
        
        <div v-if="hasUnsavedChanges" class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Unsaved changes
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Status Indicator -->
        <div class="hidden sm:flex items-center mr-2 text-xs font-medium">
          <span v-if="saveStatus === 'saving'" class="flex items-center gap-1.5 text-gray-500">
            <Loader class="w-3 h-3 animate-spin" /> Saving...
          </span>
          <span v-else-if="saveStatus === 'saved'" class="flex items-center gap-1.5 text-gray-400">
            Saved
          </span>
          <span v-else-if="saveStatus === 'error'" class="text-red-500">
             Failed to save
          </span>
        </div>

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
        
        <!-- Manual Save (only visible on mobile or if error) -->
        <Button
          variant="default"
          size="sm"
          class="sm:hidden"
          :disabled="isUpdating || !hasUnsavedChanges"
          @click="() => handleSave(false)"
        >
          <Loader v-if="isUpdating" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
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

    <!-- Unsaved Changes Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isUnsavedModalOpen"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-3 bg-amber-100 rounded-full">
                <Save class="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Unsaved Changes
                </h3>
                <p class="text-sm text-gray-500">
                  You have unsaved changes that will be lost.
                </p>
              </div>
            </div>
            
            <p class="text-gray-600 mb-6">
              Do you want to save your changes before leaving?
            </p>
            
            <div class="flex gap-3 justify-end">
              <Button variant="ghost" @click="discardChanges">
                Discard
              </Button>
              <Button variant="secondary" @click="cancelLeave">
                Continue Editing
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

/* Modal transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
