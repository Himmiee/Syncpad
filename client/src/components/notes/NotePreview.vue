<script setup lang="ts">
import { watch, computed } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { X, FileText, Clock, User } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import type { Note } from '@/services/api/notes.api';

interface Props {
  note: Note | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', note: Note): void;
}>();

// Read-only TipTap editor for rendering content
const editor = useEditor({
  extensions: [StarterKit],
  content: '',
  editable: false,
});

// Update editor content when note changes
watch(
  () => props.note?.content,
  (content) => {
    if (editor.value && content) {
      editor.value.commands.setContent(content);
    } else if (editor.value) {
      editor.value.commands.setContent('');
    }
  },
  { immediate: true }
);

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const hasContent = computed(() => {
  if (!props.note?.content) return false;
  if (typeof props.note.content === 'string') return props.note.content.length > 0;
  if (typeof props.note.content === 'object') {
    // Check if TipTap JSON has content
    return props.note.content.content?.some((node: any) => 
      node.content?.some((c: any) => c.text?.length > 0)
    );
  }
  return false;
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Note Preview</h2>
      <Button
        v-if="note"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        @click="emit('close')"
      >
        <X class="w-4 h-4" />
      </Button>
    </div>

    <!-- Empty State -->
    <div
      v-if="!note"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="p-4 bg-gray-100 rounded-full inline-flex mb-3">
          <FileText class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-400 text-sm">Select a note to view details</p>
      </div>
    </div>

    <!-- Note Content -->
    <div v-else class="flex-1 flex flex-col min-h-0">
      <!-- Note Title -->
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="p-2 rounded-lg bg-primary/10">
            <FileText class="w-5 h-5 text-primary" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ note.title }}</h3>
        </div>
        
        <!-- Meta info -->
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            <span>Updated {{ formatDate(note.updatedAt) }}</span>
          </div>
          <div v-if="note.owner" class="flex items-center gap-1">
            <User class="w-3 h-3" />
            <span>{{ note.owner.username }}</span>
          </div>
        </div>
      </div>

      <!-- Note Content -->
      <div class="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div v-if="hasContent" class="prose prose-sm max-w-none">
          <EditorContent :editor="editor" />
        </div>
        <p v-else class="text-gray-400 text-sm text-center">No content</p>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-2">
        <Button
          variant="default"
          class="flex-1"
          @click="emit('edit', note)"
        >
          Edit Note
        </Button>
      </div>
    </div>
  </div>
</template>
