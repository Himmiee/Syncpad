<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  History,
  Loader,
  RotateCcw,
  Clock,
  FileText,
  CheckCircle,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { useVersions, useRestoreVersion } from '@/composables/useNotes';
import type { NoteVersion } from '@/services/api/versions.api';

const props = defineProps<{
  isOpen: boolean;
  noteId: number;
  canRestore?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'restored'): void;
}>();

// State
const confirmingVersion = ref<number | null>(null);

// API hooks
const { data: versionsData, isLoading, refetch } = useVersions(props.noteId);
const { mutate: restoreVersion, isPending: isRestoring } = useRestoreVersion();

// Computed
const versions = computed(() => versionsData.value?.versions || []);

// Get plain text preview from TipTap content
const getPreviewText = (content: any): string => {
  try {
    if (typeof content === 'object') {
      const extractText = (node: any): string => {
        if (node.type === 'text') return node.text;
        if (node.content) {
          return node.content.map(extractText).join(' ');
        }
        return '';
      };
      const text = extractText(content);
      return text.slice(0, 100) + (text.length > 100 ? '...' : '');
    }
    return typeof content === 'string' 
      ? content.slice(0, 100) 
      : 'No content';
  } catch (e) {
    return 'No content';
  }
};

// Handlers
const handleRestore = (version: NoteVersion) => {
  if (confirmingVersion.value === version.version) {
    restoreVersion(
      { noteId: props.noteId, version: version.version },
      {
        onSuccess: () => {
          confirmingVersion.value = null;
          emit('restored');
          emit('close');
        },
      }
    );
  } else {
    confirmingVersion.value = version.version;
    // Auto-reset confirmation after 3 seconds
    setTimeout(() => {
      confirmingVersion.value = null;
    }, 3000);
  }
};

const cancelConfirmation = () => {
  confirmingVersion.value = null;
};

// Refetch versions when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    refetch();
    confirmingVersion.value = null;
  }
});
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
                <History class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Version History</h2>
                <p class="text-sm text-gray-500">Last 3 versions</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="emit('close')">
              <X class="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <div class="p-5 max-h-[60vh] overflow-y-auto">
            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center py-12">
              <Loader class="w-6 h-6 animate-spin text-gray-400" />
            </div>

            <!-- Empty State -->
            <div v-else-if="versions.length === 0" class="text-center py-12">
              <div class="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
                <History class="w-6 h-6 text-gray-300" />
              </div>
              <p class="text-sm font-medium text-gray-900 mb-1">No previous versions</p>
              <p class="text-xs text-gray-500">Versions are created when you save changes</p>
            </div>

            <!-- Versions List -->
            <div v-else class="space-y-3">
              <div
                v-for="(version, index) in versions"
                :key="version.id"
                class="relative"
              >
                <!-- Timeline connector -->
                <div 
                  v-if="index < versions.length - 1" 
                  class="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-100"
                />

                <div 
                  class="relative flex gap-4 p-4 rounded-xl border transition-all"
                  :class="index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-100'"
                >
                  <!-- Version Icon -->
                  <div class="flex-shrink-0">
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center"
                      :class="index === 0 ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-400'"
                    >
                      <FileText class="w-4 h-4" />
                    </div>
                  </div>

                  <!-- Version Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-900">
                        Version {{ version.version }}
                      </span>
                      <span 
                        v-if="index === 0" 
                        class="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                      >
                        Current
                      </span>
                    </div>

                    <p class="text-xs text-gray-500 mb-2 line-clamp-2">
                      {{ getPreviewText(version.content) }}
                    </p>

                    <div class="flex items-center gap-3 text-xs text-gray-400">
                      <span class="flex items-center gap-1">
                        <Clock class="w-3 h-3" />
                        {{ formatDistanceToNow(new Date(version.createdAt), { addSuffix: true }) }}
                      </span>
                    </div>
                  </div>

                  <!-- Restore Button -->
                  <div v-if="canRestore && index > 0" class="flex-shrink-0">
                    <div v-if="confirmingVersion === version.version" class="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        class="h-8 text-xs text-gray-500"
                        @click="cancelConfirmation"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        class="h-8 text-xs"
                        :disabled="isRestoring"
                        @click="handleRestore(version)"
                      >
                        <Loader v-if="isRestoring" class="w-3 h-3 mr-1 animate-spin" />
                        <CheckCircle v-else class="w-3 h-3 mr-1" />
                        Confirm
                      </Button>
                    </div>
                    <Button
                      v-else
                      variant="ghost"
                      size="sm"
                      class="h-8 text-xs text-gray-600 hover:text-primary"
                      @click="handleRestore(version)"
                    >
                      <RotateCcw class="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
