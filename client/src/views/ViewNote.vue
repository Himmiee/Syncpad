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
  MessageSquarePlus,
  Lock,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useNote, useUpdateNote, useRequestEditAccess } from '@/composables/useNotes';
import DeleteNoteModal from '@/components/notes/DeleteNoteModal.vue';
import CollaboratorModal from '@/components/notes/CollaboratorModal.vue';
import ShareModal from '@/components/notes/ShareModal.vue';
import VersionsModal from '@/components/notes/VersionsModal.vue';
import NoteEditorToolbar from '@/components/notes/NoteEditorToolbar.vue';
import NoteActionsMenu from '@/components/notes/NoteActionsMenu.vue';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();

// Get note ID from route
const noteId = computed(() => Number(route.params.id));

// Fetch note
const { data, isLoading, isError, error, refetch: refetchNote } = useNote(noteId.value);

const note = computed(() => data.value?.note);

// Forward declaration - will be assigned after editor is defined
let handleVersionRestored: () => Promise<void>;

// Form state
const title = ref('');
const hasUnsavedChanges = ref(false);
const originalContent = ref<any>(null);
const originalTitle = ref('');

// Delete modal state
const isDeleteModalOpen = ref(false);
const isCollaboratorModalOpen = ref(false);
const isShareModalOpen = ref(false);
const isVersionsModalOpen = ref(false);

// Request Access state
const isRequestModalOpen = ref(false);
const requestMessage = ref('');
const { mutate: requestAccess, isPending: isRequesting } = useRequestEditAccess();

// Auth
const authStore = useAuthStore();
const currentUserId = computed(() => Number(authStore.user?.id));

// Permissions
const canEdit = computed(() => {
  if (!note.value || !currentUserId.value) return false;
  if (note.value.ownerId === currentUserId.value) return true;
  const collaborator = note.value.collaborators?.find((c: any) => c.userId === currentUserId.value);
  return collaborator?.role === 'EDITOR';
});

const isOwner = computed(() => note.value?.ownerId === currentUserId.value);

const hasPendingRequest = computed(() => {
  if (!note.value || !currentUserId.value) return false;
  const collaborator = note.value.collaborators?.find((c: any) => c.userId === currentUserId.value);
  return collaborator?.requestedEditAccess;
});

const pendingRequestsCount = computed(() => {
  if (!isOwner.value || !note.value?.collaborators) return 0;
  return note.value.collaborators.filter((c: any) => c.requestedEditAccess).length;
});

const handleRequestAccess = () => {
  if (!noteId.value) return;
  requestAccess(
    { noteId: noteId.value, message: requestMessage.value },
    {
      onSuccess: () => {
        isRequestModalOpen.value = false;
        requestMessage.value = '';
      }
    }
  );
};



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

// Update editor editable state
watch(
  [() => editor.value, canEdit],
  ([editorInstance, editable]) => {
    if (editorInstance) {
      editorInstance.setEditable(editable);
    }
  },
  { immediate: true }
);

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

// Handler for when version is restored - need to refresh editor content
handleVersionRestored = async () => {
  const result = await refetchNote();
  const restoredNote = result.data?.note;
  
  if (restoredNote && editor.value) {
    // Manually update the editor with restored content
    title.value = restoredNote.title;
    originalTitle.value = restoredNote.title;
    originalContent.value = restoredNote.content || '';
    editor.value.commands.setContent(restoredNote.content || '', { emitUpdate: false });
    
    hasUnsavedChanges.value = false;
    saveStatus.value = 'saved';
    lastSavedAt.value = new Date(restoredNote.updatedAt);
  }
};

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
  if (!noteId.value || !editor.value || !canEdit.value) return;
  
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
</script>

<template>
  <div class="flex flex-col h-full bg-white text-black">
    <!-- Top Bar -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50">
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

        <!-- Mobile Actions Menu -->
        <NoteActionsMenu
          :can-edit="canEdit || false"
          :is-owner="isOwner || false"
          :has-pending-request="hasPendingRequest || false"
          :pending-requests-count="pendingRequestsCount || 0"
          @open-versions="isVersionsModalOpen = true"
          @open-collaborators="isCollaboratorModalOpen = true"
          @open-share="isShareModalOpen = true"
          @request-edit="isRequestModalOpen = true"
        />

        <!-- Desktop Action Buttons -->
        <Button variant="ghost" size="sm" class="hidden sm:flex" @click="isVersionsModalOpen = true">
          <History class="w-4 h-4 mr-2 text-gray-600" />
          <span class="text-gray-600">Versions</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="isCollaboratorModalOpen = true"
          class="relative hidden sm:flex"
        >
          <div v-if="pendingRequestsCount > 0" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
          <Users class="w-4 h-4 mr-2 text-gray-600" />
          <span class="text-gray-600">Collaborators</span>
        </Button>
        
        <Button 
          v-if="!canEdit && !isOwner"
          variant="ghost" 
          size="sm" 
          class="hidden sm:flex text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          :disabled="hasPendingRequest"
          @click="isRequestModalOpen = true"
        >
          <Lock v-if="hasPendingRequest" class="w-4 h-4 mr-2" />
          <MessageSquarePlus v-else class="w-4 h-4 mr-2" />
          <span>{{ hasPendingRequest ? 'Request Sent' : 'Request Edit' }}</span>
        </Button>
        <Button variant="ghost" size="sm" class="hidden sm:flex" @click="isShareModalOpen = true">
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
          :disabled="!canEdit"
          placeholder="Note title..."
          class="text-2xl font-semibold border-0 border-b border-gray-200 rounded-none px-0 focus:ring-0 text-gray-900 bg-transparent disabled:opacity-100 disabled:cursor-default"
        />
      </div>

      <!-- Editor Toolbar -->
      <NoteEditorToolbar
        v-if="editor && canEdit"
        :editor="editor"
      />

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

    <!-- Collaborator Modal -->
    <CollaboratorModal
      :is-open="isCollaboratorModalOpen"
      :note-id="noteId"
      :owner-id="note?.ownerId"
      :current-user-id="currentUserId"
      @close="isCollaboratorModalOpen = false"
    />

    <!-- Share Modal -->
    <ShareModal
      :is-open="isShareModalOpen"
      :note-id="noteId"
      :note-title="note?.title"
      @close="isShareModalOpen = false"
    />

    <!-- Versions Modal -->
    <VersionsModal
      :is-open="isVersionsModalOpen"
      :note-id="noteId"
      :can-restore="canEdit"
      @close="isVersionsModalOpen = false"
      @restored="handleVersionRestored"
    />

    <!-- Request Access Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isRequestModalOpen"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="isRequestModalOpen = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Request Edit Access</h3>
            <p class="text-sm text-gray-500 mb-4">
              Add a message to the owner explaining why you need access.
            </p>
            
            <textarea
              v-model="requestMessage"
              class="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] mb-4 text-gray-900"
              placeholder="e.g. I need to fix a typo..."
            ></textarea>
            
            <div class="flex justify-end gap-2">
              <Button variant="ghost" @click="isRequestModalOpen = false">Cancel</Button>
              <Button @click="handleRequestAccess" :disabled="isRequesting">
                {{ isRequesting ? 'Sending...' : 'Send Request' }}
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
