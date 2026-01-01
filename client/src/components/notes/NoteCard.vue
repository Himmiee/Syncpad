<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { FileText, Trash2, Edit, Clock, Eye } from 'lucide-vue-next';
import type { Note } from '@/services/api/notes.api';
import Button from '@/components/ui/button/Button.vue';

interface Props {
  note: Note;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
});

const emit = defineEmits<{
  (e: 'select', note: Note): void;
  (e: 'edit', note: Note): void;
  (e: 'delete', note: Note): void;
}>();

const router = useRouter();

// Format date to relative time or readable format
const formattedDate = computed(() => {
  const date = new Date(props.note.updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
});

// Extract preview text from content (handle JSON content)
const contentPreview = computed(() => {
  const content = props.note.content;
  if (!content) return 'No content';
  
  // If content is a string, use it directly
  if (typeof content === 'string') {
    return content.substring(0, 100) + (content.length > 100 ? '...' : '');
  }
  
  // If content is JSON (like from a rich text editor), try to extract text
  if (typeof content === 'object') {
    // Handle TipTap/ProseMirror JSON format
    if (content.content && Array.isArray(content.content)) {
      const text = content.content
        .map((node: any) => {
          if (node.type === 'paragraph' && node.content) {
            return node.content.map((c: any) => c.text || '').join('');
          }
          return '';
        })
        .join(' ');
      return text.substring(0, 100) + (text.length > 100 ? '...' : '') || 'No content';
    }
    return JSON.stringify(content).substring(0, 100) + '...';
  }
  
  return 'No content';
});

const handleClick = () => {
  emit('select', props.note);
};

const handleOpen = () => {
  router.push(`/dashboard/notes/${props.note.id}`);
};
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'group relative p-4 rounded-xl border cursor-pointer transition-all duration-200',
      'hover:shadow-md hover:border-primary/30',
      isSelected
        ? 'border-primary bg-primary/5 shadow-sm'
        : 'border-gray-200 bg-white hover:bg-gray-50/50'
    ]"
  >
    <!-- Card Header -->
    <div class="flex items-start justify-between gap-3 mb-2">
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <div class="p-1.5 rounded-lg bg-primary/10 shrink-0">
          <FileText class="w-4 h-4 text-primary" />
        </div>
        <h3 class="font-medium text-gray-900 truncate">
          {{ note.title }}
        </h3>
      </div>
      
      <!-- Action Buttons (show on hover) -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0"
          title="Open note"
          @click.stop="handleOpen"
        >
          <Eye class="w-3.5 h-3.5 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0"
          title="Edit note"
          @click.stop="emit('edit', note)"
        >
          <Edit class="w-3.5 h-3.5 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
          title="Delete note"
          @click.stop="emit('delete', note)"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>

    <!-- Content Preview -->
    <p class="text-sm text-gray-500 line-clamp-2 mb-3">
      {{ contentPreview }}
    </p>

    <!-- Card Footer -->
    <div class="flex items-center gap-2 text-xs text-gray-400">
      <Clock class="w-3 h-3" />
      <span>{{ formattedDate }}</span>
    </div>
  </div>
</template>
