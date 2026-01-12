<script setup lang="ts">
import { ref } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Clock, 
  Trash2, 
  Edit2, 
  CheckCircle2,
  Circle,
  PlayCircle
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { type Task, TaskStatus } from '@/services/api/tasks.api';
import { useUpdateTaskStatus } from '@/composables/useTasks';
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'edit', task: Task): void;
  (e: 'delete', task: Task): void;
  (e: 'drag-start', event: DragEvent, task: Task): void;
}>();

const { mutate: updateStatus } = useUpdateTaskStatus();

const isMenuOpen = ref(false);
const menuButtonRef = ref<HTMLElement | null>(null);
const menuContentRef = ref<HTMLElement | null>(null);

// Fixed positioning state
const menuPosition = ref({ top: '0px', left: '0px' });

// Close menu on click outside
onClickOutside(menuContentRef, (event) => {
  // Ignore clicks on the trigger button
  if (menuButtonRef.value && menuButtonRef.value.contains(event.target as Node)) {
    return;
  }
  isMenuOpen.value = false;
});

// Calculate position on open
const toggleMenu = () => {
  if (!isMenuOpen.value && menuButtonRef.value) {
    const rect = menuButtonRef.value.getBoundingClientRect();
    const menuWidth = 160; // Approximate width
    // Check if right side fits
    let left = rect.right - menuWidth;
    if (left < 10) left = 10; // Margin from left

    menuPosition.value = {
      top: `${rect.bottom + 4}px`,
      left: `${left}px`
    };
  }
  isMenuOpen.value = !isMenuOpen.value;
};

// Drag Handlers
const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('text/plain', String(props.task.id));
    emit('drag-start', event, props.task);
  }
};

const handleMove = (newStatus: TaskStatus) => {
  updateStatus({ id: props.task.id, status: newStatus });
  isMenuOpen.value = false;
};
</script>

<template>
  <div 
    class="bg-white p-4 rounded-xl  shadow-sm hover:shadow-md transition-shadow group relative cursor-grab active:cursor-grabbing"
    draggable="true"
    @dragstart="onDragStart"
  >
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1 min-w-0 pr-2">
        <h3 class="font-medium text-gray-900 truncate" :title="task.title">
          {{ task.title }}
        </h3>
      </div>
      
      <div ref="menuButtonRef">
        <Button 
          variant="ghost" 
          size="sm" 
          class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          :class="{ 'opacity-100': isMenuOpen }"
          @click.stop="toggleMenu"
        >
          <MoreVertical class="w-4 h-4 text-gray-400" />
        </Button>
      </div>

      <!-- Teleported Dropdown Menu -->
      <Teleport to="body">
        <Transition name="fade">
          <div 
            v-if="isMenuOpen"
            ref="menuContentRef"
            :style="menuPosition"
            class="fixed w-40 bg-white rounded-lg shadow-xl z-[9999] py-1 overflow-hidden"
          >
            <button 
              @click="() => { emit('edit', task); isMenuOpen = false; }"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
            >
              <Edit2 class="w-4 h-4 mr-2" /> Edit
            </button>
            
            <div class="h-px bg-gray-100 my-1"></div>
            <div class="px-3 py-1 text-xs font-semibold text-gray-500">Move to...</div>
            
            <button 
              v-if="task.status !== TaskStatus.TODO"
              @click="handleMove(TaskStatus.TODO)"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
            >
              <Circle class="w-4 h-4 mr-2" /> To Do
            </button>
            <button 
              v-if="task.status !== TaskStatus.IN_PROGRESS"
              @click="handleMove(TaskStatus.IN_PROGRESS)"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
            >
              <PlayCircle class="w-4 h-4 mr-2" /> In Progress
            </button>
            <button 
              v-if="task.status !== TaskStatus.DONE"
              @click="handleMove(TaskStatus.DONE)"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
            >
              <CheckCircle2 class="w-4 h-4 mr-2" /> Done
            </button>
            
            <div class="h-px bg-gray-100 my-1"></div>
            <button 
              @click="() => { emit('delete', task); isMenuOpen = false; }"
              class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
            >
              <Trash2 class="w-4 h-4 mr-2" /> Delete
            </button>
          </div>
        </Transition>
      </Teleport>
    </div>

    <p v-if="task.description" class="text-sm text-gray-500 mb-3 line-clamp-2">
      {{ task.description }}
    </p>

    <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
      <div class="flex items-center gap-1">
        <Clock class="w-3 h-3" />
        {{ formatDistanceToNow(new Date(task.createdAt || task.updatedAt), { addSuffix: true }) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
