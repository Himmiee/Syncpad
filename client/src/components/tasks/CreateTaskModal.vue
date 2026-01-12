<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Loader, AlignLeft, CheckSquare, Pencil } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useCreateTask, useUpdateTask } from '@/composables/useTasks';
import { TaskStatus, type Task } from '@/services/api/tasks.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const props = defineProps<{
  isOpen: boolean;
  taskToEdit?: Task | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Form state
const title = ref('');
const description = ref('');
const status = ref<TaskStatus>(TaskStatus.TODO);

// Mutations
const { mutate: createTask, isPending: isCreating } = useCreateTask();
const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

const isPending = computed(() => isCreating.value || isUpdating.value);
const isEditing = computed(() => !!props.taskToEdit);

// Sync form with taskToEdit
const resetForm = () => {
  title.value = '';
  description.value = '';
  status.value = TaskStatus.TODO;
};

watch(() => props.taskToEdit, (task) => {
  if (task) {
    title.value = task.title;
    description.value = task.description || '';
    status.value = task.status;
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen && !props.taskToEdit) {
    resetForm();
  }
});



const handleClose = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!title.value.trim()) return;

  try {
    const payload = {
      title: title.value.trim(),
      description: description.value.trim(), // Send empty string if empty, not undefined
      status: status.value,
    };

    if (isEditing.value && props.taskToEdit) {
      updateTask({
        id: props.taskToEdit.id,
        data: payload
      }, {
        onSuccess: () => {
          handleClose();
        }
      });
    } else {
      createTask(payload, {
        onSuccess: () => {
          handleClose();
        }
      });
    }
  } catch (error) {
    console.error('Failed to save task:', error);
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Pencil v-if="isEditing" class="w-5 h-5 text-primary" />
                <CheckSquare v-else class="w-5 h-5 text-primary" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? 'Edit Task' : 'New Task' }}
              </h2>
            </div>
            <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="emit('close')">
              <X class="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="p-5 space-y-5">
            <!-- Title -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700">Task Title</label>
              <Input
                v-model="title"
                placeholder="What needs to be done?"
                class="w-full text-black"
                required
                autofocus
              />
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlignLeft class="w-4 h-4 text-gray-400" />
                Description <span class="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                v-model="description"
                rows="3"
                class="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-gray-900"
                placeholder="Add details..."
              ></textarea>
            </div>

            <!-- Status -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700">Status</label>
              <Select v-model="status">
                <SelectTrigger class="w-full text-gray-900">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="TaskStatus.TODO">To Do</SelectItem>
                  <SelectItem :value="TaskStatus.IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem :value="TaskStatus.DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>

            <!-- Footer -->
          <div class="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" type="button" @click="emit('close')">Cancel</Button>
            <Button
              type="submit"
              :disabled="!title.trim() || isPending"
            >
              <Loader v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
              {{ isEditing ? 'Save Changes' : 'Create Task' }}
            </Button>
          </div>
        </div>
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
</style>
