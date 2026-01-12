<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Search, ListTodo, CheckSquare } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { useTasks, useUpdateTaskStatus } from '@/composables/useTasks';
import TaskCard from '@/components/tasks/TaskCard.vue';
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue';
import DeleteTaskModal from '@/components/tasks/DeleteTaskModal.vue';
import { TaskStatus, type Task } from '@/services/api/tasks.api';

// State
const searchQuery = ref('');
const isCreateModalOpen = ref(false);
const taskToEdit = ref<Task | null>(null);

// Delete Modal State
const isDeleteModalOpen = ref(false);
const taskToDelete = ref<Task | null>(null);

// Data Fetching
const { data: tasksData, isLoading, isError, error } = useTasks();
const { mutate: updateStatus } = useUpdateTaskStatus();

// Computed
const tasks = computed(() => tasksData.value?.tasks || []);

const filteredTasks = computed(() => {
  let result = tasks.value;
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(task => 
      task.title.toLowerCase().includes(query) || 
      task.description?.toLowerCase().includes(query)
    );
  }
  
  return result;
});

const todoTasks = computed(() => filteredTasks.value.filter(t => t.status === TaskStatus.TODO));
const inProgressTasks = computed(() => filteredTasks.value.filter(t => t.status === TaskStatus.IN_PROGRESS));
const doneTasks = computed(() => filteredTasks.value.filter(t => t.status === TaskStatus.DONE));

// Handlers
const openCreateModal = () => {
  taskToEdit.value = null;
  isCreateModalOpen.value = true;
};

const handleEditTask = (task: Task) => {
  taskToEdit.value = task;
  isCreateModalOpen.value = true;
};

const openDeleteModal = (task: Task) => {
  taskToDelete.value = task;
  isDeleteModalOpen.value = true;
};

const handleModalClose = () => {
  isCreateModalOpen.value = false;
  setTimeout(() => {
    taskToEdit.value = null;
  }, 200);
};

// Drag and Drop
const handleDragStart = (event: DragEvent, task: Task) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(task));
    event.dataTransfer.setData('text/plain', String(task.id));
  }
};

const handleDrop = (event: DragEvent, status: keyof typeof TaskStatus) => {
  const taskId = event.dataTransfer?.getData('text/plain');
  if (taskId) {
    // Optimistic update handled by Vue Query usually, closely following mutation
    updateStatus({ id: Number(taskId), status: TaskStatus[status] as any });
  }
};
</script>

<template>
  <div class="flex flex-col h-full bg-white text-black overflow-hidden">
    <!-- Header Area -->
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Tasks
        </h1>
        <!-- Mobile Add Button (Visible only on small screens if we want strict consistency, but floating might be better. 
             For now, keeping the main button responsible for desktop/mobile) -->
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks..."
            class="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
        </div>

        <Button 
          size="sm" 
          class="flex items-center gap-2 shadow-sm"
          @click="openCreateModal"
        >
          <Plus class="w-4 h-4" /> 
          <span class="hidden sm:inline">New Task</span>
          <span class="sm:hidden">Add</span>
        </Button>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="flex-1 overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden p-4 lg:p-6 bg-white">
      <div v-if="isLoading" class="flex justify-center items-center h-full">
        <!-- Skeleton Loading -->
        <div class="animate-pulse space-y-4 text-center">
          <div class="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
          <div class="text-sm text-gray-400">Loading your board...</div>
        </div>
      </div>

      <div v-else-if="isError" class="flex flex-col justify-center items-center h-full max-w-md mx-auto text-center px-4">
        <div class="p-3 bg-red-50 rounded-full mb-4">
          <CheckSquare class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load tasks</h3>
        <p class="text-sm text-gray-500 mb-6">{{ error?.message || 'Something went wrong' }}</p>
        <Button @click="() => {} /* refetch handled by query */ " variant="outline">Try Again</Button>
      </div>

      <div v-else class="flex flex-col lg:flex-row h-auto lg:h-full gap-6 lg:min-w-[900px]">
        
        <!-- To Do Column -->
        <div 
          class="flex-1 lg:min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col h-auto min-h-[300px] lg:h-full border border-gray-100"
          @dragover.prevent
          @drop="handleDrop($event, 'TODO')"
        >
          <div class="flex items-center justify-between mb-4 px-1">
             <div class="flex items-center gap-2">
               <div class="w-2 h-2 rounded-full ring-2 ring-gray-200 bg-white"></div>
               <span class="font-medium text-gray-700">To Do</span>
               <span class="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-100">{{ todoTasks.length }}</span>
             </div>
          </div>
          
          <div class="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1 pb-2">
            <div v-if="todoTasks.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-white/50">
              <CheckSquare class="w-8 h-8 mb-2 opacity-50" />
              <span class="text-xs">No tasks to do</span>
            </div>

            <TaskCard 
              v-for="task in todoTasks" 
              :key="task.id" 
              :task="task"
              @edit="handleEditTask"
              @delete="openDeleteModal"
              @drag-start="handleDragStart"
            />
          </div>
        </div>

        <!-- In Progress Column -->
        <div 
          class="flex-1 lg:min-w-[300px] bg-blue-50/50 rounded-xl p-4 flex flex-col h-auto min-h-[300px] lg:h-full border border-blue-100/50"
          @dragover.prevent
          @drop="handleDrop($event, 'IN_PROGRESS')"
        >
          <div class="flex items-center justify-between mb-4 px-1">
             <div class="flex items-center gap-2">
               <div class="w-2 h-2 rounded-full ring-2 ring-blue-200 bg-blue-500"></div>
               <span class="font-medium text-gray-700">In Progress</span>
               <span class="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-100">{{ inProgressTasks.length }}</span>
             </div>
          </div>
          
          <div class="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1 pb-2">
            <div v-if="inProgressTasks.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-blue-100 rounded-lg bg-white/50">
              <ListTodo class="w-8 h-8 mb-2 opacity-50" />
              <span class="text-xs">Drag tasks here</span>
            </div>
            
            <TaskCard 
              v-for="task in inProgressTasks" 
              :key="task.id" 
              :task="task"
              @edit="handleEditTask"
              @delete="openDeleteModal"
              @drag-start="handleDragStart"
            />
          </div>
        </div>

        <!-- Done Column -->
        <div 
          class="flex-1 min-w-[300px] bg-green-50/50 rounded-xl p-4 flex flex-col h-auto min-h-[300px] lg:h-full border border-green-100/50"
          @dragover.prevent
          @drop="handleDrop($event, 'DONE')"
        >
          <div class="flex items-center justify-between mb-4 px-1">
             <div class="flex items-center gap-2">
               <div class="w-2 h-2 rounded-full ring-2 ring-green-200 bg-green-500"></div>
               <span class="font-medium text-gray-700">Done</span>
               <span class="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-100">{{ doneTasks.length }}</span>
             </div>
          </div>
          
          <div class="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1 pb-2">
             <div v-if="doneTasks.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-green-100 rounded-lg bg-white/50">
              <CheckSquare class="w-8 h-8 mb-2 opacity-50" />
              <span class="text-xs">No completed tasks</span>
            </div>

            <TaskCard 
              v-for="task in doneTasks" 
              :key="task.id" 
              :task="task"
              @edit="handleEditTask"
              @delete="openDeleteModal"
              @drag-start="handleDragStart"
            />
          </div>
        </div>

      </div>
    </div>

    <CreateTaskModal
      :is-open="isCreateModalOpen"
      :task-to-edit="taskToEdit"
      @close="handleModalClose"
    />

    <DeleteTaskModal
      :is-open="isDeleteModalOpen"
      :task="taskToDelete"
      @close="isDeleteModalOpen = false"
      @deleted="() => {} /* Handled by UseQuery */"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}
</style>
