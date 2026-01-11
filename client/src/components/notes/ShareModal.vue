<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  Link,
  Copy,
  Check,
  Loader,
  Trash2,
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Globe,
  Lock,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useShareLinks,
  useCreateShareLink,
  useDeleteShareLink,
} from '@/composables/useNotes';
import type { ShareLink } from '@/services/api/share.api';

const props = defineProps<{
  isOpen: boolean;
  noteId: number;
  noteTitle?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// State
const permission = ref<'VIEW' | 'EDIT'>('VIEW');
const expiryDays = ref<string>('never');
const copiedToken = ref<string | null>(null);

// API hooks
const { data: linksData, isLoading: isLoadingLinks } = useShareLinks(props.noteId);
const { mutate: createLink, isPending: isCreating } = useCreateShareLink();
const { mutate: deleteLink } = useDeleteShareLink();

// Computed
const links = computed(() => linksData.value?.links || []);
const activeLinks = computed(() => links.value.filter((l: ShareLink) => l.isActive));

// Get base URL for share links
const baseUrl = computed(() => {
  return `${window.location.origin}/shared`;
});

const getShareUrl = (token: string) => `${baseUrl.value}/${token}`;

// Convert expiry string to number
const getExpiryDays = (): number | undefined => {
  if (expiryDays.value === 'never') return undefined;
  return parseInt(expiryDays.value);
};

// Handlers
const handleCreateLink = () => {
  createLink(
    {
      noteId: props.noteId,
      data: {
        permission: permission.value,
        expiresInDays: getExpiryDays(),
      },
    },
    {
      onSuccess: (data) => {
        // Auto-copy to clipboard
        navigator.clipboard.writeText(data.url);
        copiedToken.value = data.shareLink.token;
        setTimeout(() => {
          copiedToken.value = null;
        }, 2000);
      },
    }
  );
};

const handleCopyLink = async (token: string) => {
  await navigator.clipboard.writeText(getShareUrl(token));
  copiedToken.value = token;
  setTimeout(() => {
    copiedToken.value = null;
  }, 2000);
};

const handleDeleteLink = (token: string) => {
  deleteLink({ token, noteId: props.noteId });
};

// Social share functions
const shareTitle = computed(() => props.noteTitle || 'Check out this note');

const socialPlatforms = computed(() => {
  const firstLink = activeLinks.value[0];
  if (!firstLink) return [];
  
  const url = getShareUrl(firstLink.token);
  const title = shareTitle.value;
  
  return [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-sky-50 hover:text-sky-500',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-50 hover:text-green-500',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    },
  ];
});

const openSocialShare = (url: string) => {
  window.open(url, '_blank', 'width=600,height=400');
};

// Reset state when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    permission.value = 'VIEW';
    expiryDays.value = 'never';
    copiedToken.value = null;
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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Link class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Share Note</h2>
                <p class="text-sm text-gray-500">Create a shareable link</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="emit('close')">
              <X class="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <div class="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
            <!-- Create New Link Section -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-900">Create Share Link</h3>
              
              <div class="flex flex-col sm:flex-row gap-3">
                <!-- Permission Select -->
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1.5">Permission</label>
                  <Select v-model="permission">
                    <SelectTrigger class="w-full text-gray-900">
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEW">View Only</SelectItem>
                      <SelectItem value="EDIT">Can Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <!-- Expiry Select -->
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1.5">Expires In</label>
                  <Select v-model="expiryDays">
                    <SelectTrigger class="w-full text-gray-900">
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                class="w-full"
                :disabled="isCreating"
                @click="handleCreateLink"
              >
                <Loader v-if="isCreating" class="w-4 h-4 mr-2 animate-spin" />
                <Link v-else class="w-4 h-4 mr-2" />
                Generate Link
              </Button>
            </div>

            <!-- Active Links Section -->
            <div v-if="!isLoadingLinks && activeLinks.length > 0" class="space-y-3">
              <h3 class="text-sm font-medium text-gray-900">Active Links</h3>
              
              <div class="space-y-2">
                <div
                  v-for="link in activeLinks"
                  :key="link.token"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div class="flex-shrink-0">
                    <Globe v-if="link.permission === 'VIEW'" class="w-4 h-4 text-gray-400" />
                    <Lock v-else class="w-4 h-4 text-amber-500" />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ link.permission === 'VIEW' ? 'View Only' : 'Can Edit' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Created {{ formatDistanceToNow(new Date(link.createdAt), { addSuffix: true }) }}
                      <span v-if="link.expiresAt" class="text-amber-600">
                        • Expires {{ formatDistanceToNow(new Date(link.expiresAt), { addSuffix: true }) }}
                      </span>
                    </p>
                  </div>

                  <div class="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-8 w-8 p-0"
                      @click="handleCopyLink(link.token)"
                    >
                      <Check v-if="copiedToken === link.token" class="w-4 h-4 text-green-500" />
                      <Copy v-else class="w-4 h-4 text-gray-500" />
                    </Button>
                    <a
                      :href="getShareUrl(link.token)"
                      target="_blank"
                      class="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink class="w-4 h-4 text-gray-500" />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                      @click="handleDeleteLink(link.token)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingLinks" class="flex items-center justify-center py-8">
              <Loader class="w-5 h-5 animate-spin text-gray-400" />
            </div>

            <!-- Social Share Section -->
            <div v-if="activeLinks.length > 0" class="space-y-3 pt-3 border-t border-gray-100">
              <h3 class="text-sm font-medium text-gray-900">Share on Social</h3>
              
              <div class="flex items-center gap-2">
                <button
                  v-for="platform in socialPlatforms"
                  :key="platform.name"
                  class="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-500 transition-colors"
                  :class="platform.color"
                  :title="platform.name"
                  @click="openSocialShare(platform.url)"
                >
                  <component :is="platform.icon" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!isLoadingLinks && activeLinks.length === 0" class="text-center py-6">
              <div class="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
                <Link class="w-6 h-6 text-gray-300" />
              </div>
              <p class="text-sm text-gray-500">No active share links</p>
              <p class="text-xs text-gray-400">Create a link to share this note</p>
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
