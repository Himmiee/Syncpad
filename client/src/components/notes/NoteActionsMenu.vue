<script setup lang="ts">
import { ref } from 'vue';
import {
  MoreVertical,
  History,
  Users,
  Share2,
  MessageSquarePlus,
  Lock,
  X,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';

defineProps<{
  canEdit: boolean;
  isOwner: boolean;
  hasPendingRequest: boolean;
  pendingRequestsCount: number;
}>();

const emit = defineEmits<{
  (e: 'open-versions'): void;
  (e: 'open-collaborators'): void;
  (e: 'open-share'): void;
  (e: 'request-edit'): void;
}>();

const isOpen = ref(false);

const handleAction = (action: () => void) => {
  action();
  isOpen.value = false;
};
</script>

<template>
  <!-- Mobile Menu Button -->
  <div class="relative sm:hidden">
    <Button
      variant="ghost"
      size="sm"
      class="h-9 w-9 p-0"
      @click="isOpen = !isOpen"
    >
      <MoreVertical class="w-5 h-5 text-gray-600" />
      <div 
        v-if="pendingRequestsCount > 0" 
        class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" 
      />
    </Button>

    <!-- Dropdown Menu -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 bg-black/40 z-50"
          @click="isOpen = false"
        >
          <!-- Bottom Sheet -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-8 safe-area-pb"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Actions</h3>
              <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="isOpen = false">
                <X class="w-4 h-4 text-gray-500" />
              </Button>
            </div>
            
            <div class="space-y-1">
              <!-- Versions -->
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                @click="handleAction(() => emit('open-versions'))"
              >
                <div class="p-2 bg-gray-100 rounded-lg">
                  <History class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Version History</p>
                  <p class="text-xs text-gray-500">View past versions</p>
                </div>
              </button>

              <!-- Collaborators -->
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left relative"
                @click="handleAction(() => emit('open-collaborators'))"
              >
                <div class="p-2 bg-gray-100 rounded-lg relative">
                  <Users class="w-5 h-5 text-gray-600" />
                  <div 
                    v-if="pendingRequestsCount > 0" 
                    class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" 
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Collaborators</p>
                  <p class="text-xs text-gray-500">
                    Manage who can access
                    <span v-if="pendingRequestsCount > 0" class="text-red-500">
                      • {{ pendingRequestsCount }} pending
                    </span>
                  </p>
                </div>
              </button>

              <!-- Share -->
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                @click="handleAction(() => emit('open-share'))"
              >
                <div class="p-2 bg-gray-100 rounded-lg">
                  <Share2 class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Share</p>
                  <p class="text-xs text-gray-500">Create shareable link</p>
                </div>
              </button>

              <!-- Request Edit (only for non-editors) -->
              <button
                v-if="!canEdit && !isOwner"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-50 transition-colors text-left"
                :class="hasPendingRequest ? 'opacity-60' : ''"
                :disabled="hasPendingRequest"
                @click="handleAction(() => emit('request-edit'))"
              >
                <div class="p-2 bg-amber-100 rounded-lg">
                  <Lock v-if="hasPendingRequest" class="w-5 h-5 text-amber-600" />
                  <MessageSquarePlus v-else class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p class="font-medium text-amber-700">
                    {{ hasPendingRequest ? 'Request Sent' : 'Request Edit Access' }}
                  </p>
                  <p class="text-xs text-amber-600">
                    {{ hasPendingRequest ? 'Waiting for owner approval' : 'Ask owner for permission' }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
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

.safe-area-pb {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}
</style>
