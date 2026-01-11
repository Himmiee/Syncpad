<script setup lang="ts">
import { 
  Users, 
  X, 
  Loader, 
  Mail, 
  Trash2, 
  UserPlus,
  MessageCircle,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import {
  useCollaborators,
  useAddCollaborator,
  useRemoveCollaborator,
  useUpdateCollaborator,
  useDenyEditAccess,
} from '@/composables/useNotes';
import { ref } from 'vue';

interface Props {
  isOpen: boolean;
  noteId: number | null;
  ownerId?: number; 
  currentUserId?: number; 
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// State
const email = ref('');
const role = ref<'VIEWER' | 'EDITOR'>('VIEWER');

// Queries
const { data: collaboratorsData, isLoading } = useCollaborators(props.noteId || 0);
const { mutate: addCollaborator, isPending: isAdding } = useAddCollaborator();
const { mutate: removeCollaborator } = useRemoveCollaborator();
const { mutate: updateCollaborator } = useUpdateCollaborator();
const { mutate: denyEditAccess } = useDenyEditAccess();

// Computed
// const collaborators = computed(() => collaboratorsData.value?.collaborators || []);

const handleAdd = () => {
  if (!props.noteId || !email.value) return;

  addCollaborator(
    { 
      noteId: props.noteId,
      data: { email: email.value, role: role.value } 
    },
    {
      onSuccess: () => {
        email.value = ''; // Reset form
      }
    }
  );
};

const handleRemove = (collabId: number) => {
  if (!props.noteId) return;
  removeCollaborator({ noteId: props.noteId, collabId });
};

const handleUpdateRole = (collabId: number, newRole: 'VIEWER' | 'EDITOR') => {
  if (!props.noteId) return;
  updateCollaborator({ noteId: props.noteId, collabId, role: newRole });
};

const handleApprove = (collabId: number) => {
  if (!props.noteId) return;
  updateCollaborator({ noteId: props.noteId, collabId, role: 'EDITOR' });
};

const handleDeny = (collabId: number) => {
  if (!props.noteId) return;
  denyEditAccess({ noteId: props.noteId, collabId });
};

const handleClose = () => {
  emit('close');
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
            class="bg-white rounded-xl shadow-xl max-w-xl w-full flex flex-col max-h-[80vh] text-gray-900"
          >
            <!-- Header -->
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary/10 rounded-full">
                  <Users class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Collaborators</h3>
                  <p class="text-sm text-gray-500">Manage access to this note</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="handleClose">
                <X class="w-5 h-5 text-gray-400 hover:text-gray-900" />
              </Button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Add User Form -->
              <div class="mb-8">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Add collaborator by email
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      v-model="email"
                      type="email"
                      placeholder="user@example.com"
                      class="pl-9"
                      @keyup.enter="handleAdd"
                    />
                  </div>
                  <Button 
                    @click="handleAdd" 
                    :disabled="isAdding || !email"
                  >
                    <Loader v-if="isAdding" class="w-4 h-4 animate-spin" />
                    <UserPlus v-else class="w-4 h-4" />
                    <span class="ml-2 hidden sm:inline">Add</span>
                  </Button>
                </div>
              </div>

              <!-- List -->
              <div>
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  People with access
                </h4>

                <div v-if="isLoading" class="flex justify-center py-4">
                  <Loader class="w-6 h-6 animate-spin text-primary" />
                </div>

                <div v-else class="space-y-4">
                  <!-- Collaborators List -->
                  <div 
                    v-for="collab in collaboratorsData?.collaborators || []" 
                    :key="collab.id"
                    class="flex items-start justify-between group py-3"
                  >
                    <div class="flex items-start gap-3 flex-1 min-w-0 pr-4">
                      <!-- Avatar -->
                      <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 mt-1 flex-shrink-0">
                        <img 
                          v-if="collab.user.avatar" 
                          :src="collab.user.avatar" 
                          class="w-full h-full object-cover" 
                          alt="Avatar"
                        />
                        <span v-else class="text-xs font-semibold text-gray-600">
                          {{ collab.user.username.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ collab.user.username }}
                        </p>
                        <p class="text-xs text-gray-500 truncate mb-1">
                          {{ collab.user.email }}
                        </p>

                        <!-- Request Info (Nested) -->
                        <div v-if="collab.requestedEditAccess" class="mt-2 bg-amber-50 rounded-md p-2 border border-amber-100">
                          <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <div class="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
                              <MessageCircle class="w-3 h-3" />
                              Requested Edit
                            </div>

                            <!-- Owner Actions -->
                            <div v-if="props.ownerId === props.currentUserId" class="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                class="h-5 w-auto px-2 text-xs bg-green-100 text-green-700 hover:bg-green-200"
                                @click="handleApprove(collab.id)"
                              >
                                Approve
                              </Button>
                               <Button
                                variant="ghost"
                                size="sm"
                                class="h-5 w-auto px-2 text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                @click="handleDeny(collab.id)"
                              >
                                Deny
                              </Button>
                            </div>
                          </div>
                          
                          <p v-if="collab.requestMessage" class="text-xs text-amber-800 italic break-words">
                            "{{ collab.requestMessage }}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 flex-shrink-0 mt-1">
                      <!-- Role Badge/Selector -->
                      <Select
                        :model-value="collab.role"
                        @update:model-value="(val) => handleUpdateRole(collab.id, val as 'VIEWER' | 'EDITOR')"
                      >
                         <SelectTrigger class="w-[100px] h-8 text-xs border-0 bg-transparent hover:bg-gray-50 focus:ring-0 shadow-none">
                            <SelectValue placeholder="Role" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="VIEWER">Viewer</SelectItem>
                           <SelectItem value="EDITOR">Editor</SelectItem>
                         </SelectContent>
                      </Select>

                      <!-- Remove Button -->
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        @click="handleRemove(collab.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div v-if="!collaboratorsData?.collaborators?.length" class="text-center py-4 text-gray-400 text-sm italic">
                    No collaborators yet.
                  </div>
                </div>
              </div>
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
