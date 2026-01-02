<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '@/services/api/notes.api';

const props = defineProps<{
  note: Note;
  isSelected?: boolean;
}>();

defineEmits<{
  (e: 'select', note: Note): void;
}>();

// Get plain text from TipTap JSON content for preview
const previewText = computed(() => {
  try {
    if (typeof props.note.content === 'object') {
      // Basic extraction of text from TipTap JSON
      const extractText = (node: any): string => {
        if (node.type === 'text') return node.text;
        if (node.content) {
          return node.content.map(extractText).join(' ');
        }
        return '';
      };
      const text = extractText(props.note.content);
      return text.slice(0, 80) + (text.length > 80 ? '...' : '');
    }
    return typeof props.note.content === 'string' 
      ? props.note.content.slice(0, 80) 
      : 'No content';
  } catch (e) {
    return 'No content';
  }
});
</script>

<template>
  <div
    @click="$emit('select', note)"
    class="group cursor-pointer p-4 border-b border-gray-100 transition-all duration-200 hover:bg-gray-50"
    :class="{ 'bg-primary/5 border-primary/20 hover:bg-primary/10': isSelected }"
  >
    <div class="flex justify-between items-start mb-1">
      <h3 
        class="font-medium truncate pr-2 transition-colors"
        :class="isSelected ? 'text-primary' : 'text-gray-900 group-hover:text-gray-900'"
      >
        {{ note.title || 'Untitled Note' }}
      </h3>
      <span class="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
        {{ formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) }}
      </span>
    </div>
    
    <p class="text-sm text-gray-500 line-clamp-2 leading-relaxed">
      {{ previewText }}
    </p>
  </div>
</template>
