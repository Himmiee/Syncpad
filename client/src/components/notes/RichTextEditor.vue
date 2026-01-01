<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { watch, onBeforeUnmount } from 'vue';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Code,
  Quote,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';

interface Props {
  modelValue: any;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start writing...',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  content: props.modelValue || '',
  editable: !props.disabled,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getJSON());
  },
});

// Watch for external content changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editor.value) return;
    
    const currentContent = editor.value.getJSON();
    
    // Only update if content actually changed (avoid infinite loops)
    if (JSON.stringify(currentContent) !== JSON.stringify(newValue)) {
      editor.value.commands.setContent(newValue || '');
    }
  }
);

// Watch disabled state
watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled);
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

// Toolbar button helper
const isActive = (type: string, attrs?: Record<string, any>) => {
  return editor.value?.isActive(type, attrs) ?? false;
};
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 text-gray-700"
    >
      <!-- Text Formatting -->
      <div class="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('bold') }"
          @click="editor?.chain().focus().toggleBold().run()"
          :disabled="disabled"
        >
          <Bold class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('italic') }"
          @click="editor?.chain().focus().toggleItalic().run()"
          :disabled="disabled"
        >
          <Italic class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('strike') }"
          @click="editor?.chain().focus().toggleStrike().run()"
          :disabled="disabled"
        >
          <Strikethrough class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('code') }"
          @click="editor?.chain().focus().toggleCode().run()"
          :disabled="disabled"
        >
          <Code class="w-4 h-4 text-gray-700" />
        </Button>
      </div>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Headings -->
      <div class="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('heading', { level: 1 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          :disabled="disabled"
        >
          <Heading1 class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('heading', { level: 2 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          :disabled="disabled"
        >
          <Heading2 class="w-4 h-4 text-gray-700" />
        </Button>
      </div>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Lists -->
      <div class="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('bulletList') }"
          @click="editor?.chain().focus().toggleBulletList().run()"
          :disabled="disabled"
        >
          <List class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('orderedList') }"
          @click="editor?.chain().focus().toggleOrderedList().run()"
          :disabled="disabled"
        >
          <ListOrdered class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          :class="{ 'bg-gray-200': isActive('blockquote') }"
          @click="editor?.chain().focus().toggleBlockquote().run()"
          :disabled="disabled"
        >
          <Quote class="w-4 h-4 text-gray-700" />
        </Button>
      </div>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Undo/Redo -->
      <div class="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          @click="editor?.chain().focus().undo().run()"
          :disabled="disabled || !editor?.can().undo()"
        >
          <Undo class="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          @click="editor?.chain().focus().redo().run()"
          :disabled="disabled || !editor?.can().redo()"
        >
          <Redo class="w-4 h-4 text-gray-700" />
        </Button>
      </div>
    </div>

    <EditorContent
      :editor="editor"
      class="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none bg-white text-gray-900"
    />
  </div>
</template>

<style>
/* TipTap Editor Styles */
.ProseMirror {
  min-height: 280px;
  outline: none;
  color: #111827; /* gray-900 */
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.ProseMirror h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.ProseMirror h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.ProseMirror p {
  margin-bottom: 0.5rem;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror li {
  margin-bottom: 0.25rem;
  color: #111827;
}

.ProseMirror li::marker {
  color: #374151;
}

.ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0;
  color: #6b7280;
}

.ProseMirror code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.ProseMirror pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.ProseMirror pre code {
  background: none;
  padding: 0;
  color: inherit;
}
</style>
