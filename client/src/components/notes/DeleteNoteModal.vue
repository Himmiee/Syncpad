<script setup lang="ts">
import { AlertTriangle, Loader, Trash2 } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { useDeleteNote } from '@/composables/useNotes';
import type { Note } from '@/services/api/notes.api';

interface Props {
  isOpen: boolean;
  note: Note | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'deleted'): void;
}>();

const { mutate: deleteNote, isPending } = useDeleteNote();

const handleDelete = () => {
  if (!props.note) return;
  
  deleteNote(props.note.id, {
    onSuccess: () => {
      emit('deleted');
      emit('close');
    },
  });
};

const handleClose = () => {
  if (!isPending.value) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <Transition name="scale">
          <div
            v-if="isOpen"
            class="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div class="p-3 bg-red-100 rounded-full">
                <AlertTriangle class="w-8 h-8 text-red-600" />
              </div>
            </div>

            <!-- Content -->
            <div class="text-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                Delete Note
              </h3>
              <p class="text-gray-500 text-sm">
                Are you sure you want to delete 
                <span class="font-medium text-gray-700">"{{ note?.title }}"</span>? 
                This action cannot be undone.
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <Button
                variant="secondary"
                class="flex-1"
                @click="handleClose"
                :disabled="isPending"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white"
                @click="handleDelete"
                :disabled="isPending"
              >
                <Loader v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                <Trash2 v-else class="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Transition>
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

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
