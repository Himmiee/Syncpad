<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Save, Loader } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import RichTextEditor from '@/components/notes/RichTextEditor.vue';
import { useCreateNote, useUpdateNote } from '@/composables/useNotes';
import type { Note } from '@/services/api/notes.api';

interface Props {
  isOpen: boolean;
  note?: Note | null; // If provided, we're editing
}

const props = withDefaults(defineProps<Props>(), {
  note: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

// Form state
const title = ref('');
const content = ref<any>('');

// Mutations
const { mutate: createNote, isPending: isCreating } = useCreateNote();
const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();

const isPending = computed(() => isCreating.value || isUpdating.value);
const isEditing = computed(() => !!props.note);
const modalTitle = computed(() => isEditing.value ? 'Edit Note' : 'Create New Note');

// Reset form when note changes or modal opens
watch(
  () => [props.isOpen, props.note],
  () => {
    if (props.isOpen) {
      if (props.note) {
        title.value = props.note.title;
        // Handle content - use JSON directly for TipTap
        content.value = props.note.content || '';
      } else {
        title.value = '';
        content.value = '';
      }
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (!title.value.trim()) return;

  // Send content as plain string - backend accepts any JSON-compatible value
  const noteContent = content.value;

  if (isEditing.value && props.note) {
    updateNote(
      {
        id: props.note.id,
        data: { title: title.value.trim(), content: noteContent },
      },
      {
        onSuccess: () => {
          emit('saved');
          emit('close');
        },
      }
    );
  } else {
    createNote(
      { title: title.value.trim(), content: noteContent },
      {
        onSuccess: () => {
          emit('saved');
          emit('close');
        },
      }
    );
  }
};

const handleClose = () => {
  if (!isPending.value) {
    emit('close');
  }
};
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="handleClose"
      />
    </Transition>

    <!-- Drawer/Modal -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ modalTitle }}</h2>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            @click="handleClose"
            :disabled="isPending"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Title Input -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Title</label>
              <Input
                v-model="title"
                placeholder="Enter note title..."
                :disabled="isPending"
                class="w-full text-gray-900 bg-white border-gray-300"
              />
            </div>

            <!-- Content Editor -->
            <div class="space-y-2 flex-1">
              <label class="text-sm font-medium text-gray-700">Content</label>
              <RichTextEditor
                v-model="content"
                placeholder="Write your note content here..."
                :disabled="isPending"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              @click="handleClose"
              :disabled="isPending"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              :disabled="isPending || !title.trim()"
            >
              <Loader v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
              <Save v-else class="w-4 h-4 mr-2" />
              {{ isEditing ? 'Save Changes' : 'Create Note' }}
            </Button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
