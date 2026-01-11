<script setup lang="ts">
import { type Editor } from '@tiptap/vue-3';
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

defineProps<{
  editor: Editor | undefined;
}>();

// Toolbar helpers
const isActive = (editor: Editor | undefined, type: string, attrs?: Record<string, any>) => {
  return editor?.isActive(type, attrs) ?? false;
};
</script>

<template>
  <div
    v-if="editor"
    class="flex flex-wrap items-center gap-1 px-4 sm:px-8 py-3 border-b border-gray-100"
  >
    <!-- Text Formatting -->
    <div class="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'bold') }"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <Bold class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'italic') }"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <Italic class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'strike') }"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <Strikethrough class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'code') }"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <Code class="w-4 h-4 text-gray-700" />
      </Button>
    </div>

    <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

    <!-- Headings -->
    <div class="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'heading', { level: 1 }) }"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <Heading1 class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'heading', { level: 2 }) }"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2 class="w-4 h-4 text-gray-700" />
      </Button>
    </div>

    <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

    <!-- Lists & Quotes -->
    <div class="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'bulletList') }"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <List class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'orderedList') }"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        :class="{ 'bg-gray-200': isActive(editor, 'blockquote') }"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <Quote class="w-4 h-4 text-gray-700" />
      </Button>
    </div>

    <div class="w-px h-6 bg-gray-200 mx-1" />

    <!-- Undo/Redo -->
    <div class="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
      >
        <Undo class="w-4 h-4 text-gray-700" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0"
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
      >
        <Redo class="w-4 h-4 text-gray-700" />
      </Button>
    </div>
  </div>
</template>
