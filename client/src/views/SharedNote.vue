<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Loader,
  AlertCircle,
  ExternalLink,
  User,
  Clock,
} from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { shareApi } from '@/services/api/share.api';

const route = useRoute();

// Get token from route
const token = computed(() => route.params.token as string);

// Fetch shared note
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['shared-note', token.value],
  queryFn: () => shareApi.getSharedNote(token.value),
  enabled: !!token.value,
  retry: 1,
});

const note = computed(() => data.value?.note);
const permission = computed(() => data.value?.permission || 'VIEW');

// Get plain text preview from TipTap content
const contentHtml = computed(() => {
  if (!note.value?.content) return '<p class="text-gray-400">No content</p>';
  
  try {
    // Simple render of TipTap JSON to HTML
    const renderNode = (node: any): string => {
      if (!node) return '';
      
      switch (node.type) {
        case 'doc':
          return node.content?.map(renderNode).join('') || '';
        case 'paragraph':
          const pContent = node.content?.map(renderNode).join('') || '';
          return `<p class="mb-3">${pContent || '<br>'}</p>`;
        case 'heading':
          const level = node.attrs?.level || 1;
          const hContent = node.content?.map(renderNode).join('') || '';
          const sizes: Record<number, string> = {
            1: 'text-2xl font-bold mb-4',
            2: 'text-xl font-semibold mb-3',
            3: 'text-lg font-medium mb-2',
          };
          return `<h${level} class="${sizes[level] || ''}">${hContent}</h${level}>`;
        case 'bulletList':
          return `<ul class="list-disc pl-6 mb-3">${node.content?.map(renderNode).join('') || ''}</ul>`;
        case 'orderedList':
          return `<ol class="list-decimal pl-6 mb-3">${node.content?.map(renderNode).join('') || ''}</ol>`;
        case 'listItem':
          return `<li class="mb-1">${node.content?.map(renderNode).join('') || ''}</li>`;
        case 'blockquote':
          return `<blockquote class="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-3">${node.content?.map(renderNode).join('') || ''}</blockquote>`;
        case 'codeBlock':
          return `<pre class="bg-gray-100 rounded-lg p-4 mb-3 overflow-x-auto"><code>${node.content?.map(renderNode).join('') || ''}</code></pre>`;
        case 'text':
          let text = node.text || '';
          // Apply marks
          if (node.marks) {
            for (const mark of node.marks) {
              switch (mark.type) {
                case 'bold':
                  text = `<strong>${text}</strong>`;
                  break;
                case 'italic':
                  text = `<em>${text}</em>`;
                  break;
                case 'strike':
                  text = `<s>${text}</s>`;
                  break;
                case 'code':
                  text = `<code class="bg-gray-100 px-1 rounded text-sm">${text}</code>`;
                  break;
              }
            }
          }
          return text;
        default:
          return node.content?.map(renderNode).join('') || '';
      }
    };
    
    return renderNode(note.value.content);
  } catch (e) {
    return '<p class="text-gray-400">Unable to render content</p>';
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <FileText class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 class="font-semibold text-gray-900">Syncpad</h1>
            <p class="text-xs text-gray-500">Shared Note</p>
          </div>
        </div>
        
        <a href="/" class="hidden sm:block">
          <Button variant="default" size="sm">
            <ExternalLink class="w-4 h-4 mr-2" />
            Try Syncpad Free
          </Button>
        </a>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <Loader class="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p class="text-gray-500">Loading shared note...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="flex items-center justify-center min-h-[60vh] px-4">
      <div class="text-center max-w-md">
        <div class="p-4 bg-red-50 rounded-full w-fit mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-500" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Link Not Found</h2>
        <p class="text-gray-500 mb-6">
          {{ (error as any)?.message || 'This share link may have expired or been revoked.' }}
        </p>
        <a href="/auth/login">
          <Button>Go to Syncpad</Button>
        </a>
      </div>
    </div>

    <!-- Note Content -->
    <main v-else-if="note" class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <article class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Note Header -->
        <div class="p-6 sm:p-8 border-b border-gray-100">
          <div class="flex items-center gap-2 mb-4">
            <span 
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              :class="permission === 'VIEW' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'"
            >
              {{ permission === 'VIEW' ? 'View Only' : 'Can Edit' }}
            </span>
          </div>
          
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {{ note.title || 'Untitled Note' }}
          </h1>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4" />
              <span>{{ note.owner?.username || 'Anonymous' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4" />
              <span>Updated {{ formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) }}</span>
            </div>
          </div>
        </div>

        <!-- Note Body -->
        <div class="p-6 sm:p-8">
          <div 
            class="prose prose-gray max-w-none text-gray-800"
            v-html="contentHtml"
          />
        </div>
      </article>

      <!-- Footer CTA -->
      <div class="mt-8 text-center">
        <p class="text-gray-500 mb-4">Create your own notes with Syncpad</p>
        <a href="/auth/register">
          <Button size="lg">
            Get Started Free
          </Button>
        </a>
      </div>
    </main>
  </div>
</template>
