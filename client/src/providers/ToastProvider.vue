<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue'
import type { CreateToasterReturn } from '@ark-ui/vue'
import {
  CircleAlertIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  XIcon,
} from 'lucide-vue-next'
import { provide } from 'vue'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
  duration: 5000,
  max: 3,
})

const iconMap = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
}

const colorMap = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-orange-50 border-orange-200',
  info: 'bg-blue-50 border-blue-200',
}

const iconColorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-orange-600',
  info: 'text-blue-600',
}

const textColorMap = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-orange-900',
  info: 'text-blue-900',
}

// Provide toaster for use in components
provide<CreateToasterReturn>('toaster', toaster)
</script>

<template>
  <div>
    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root
        :class="[
          'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all min-w-[320px]',
          toast.type ? colorMap[toast.type as keyof typeof colorMap] : 'bg-white border-gray-200',
          toast.type ? textColorMap[toast.type as keyof typeof textColorMap] : 'text-gray-900',
        ]"
      >
        <!-- Icon -->
        <component
          v-if="toast.type"
          :is="iconMap[toast.type as keyof typeof iconMap]"
          :class="['w-5 h-5 flex-shrink-0 mt-0.5', iconColorMap[toast.type as keyof typeof iconColorMap]]"
        />

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <Toast.Title class="font-semibold text-sm mb-1">
            {{ toast.title }}
          </Toast.Title>
          <Toast.Description v-if="toast.description" class="text-sm opacity-90">
            {{ toast.description }}
          </Toast.Description>
        </div>

        <!-- Close Button -->
        <Toast.CloseTrigger class="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
          <XIcon class="w-4 h-4" />
        </Toast.CloseTrigger>
      </Toast.Root>
    </Toaster>

    <!-- Slot for child content -->
    <slot />
  </div>
</template>

<style scoped>
[data-scope='toast'][data-part='root'] {
  translate: var(--x) var(--y);
  scale: var(--scale);
  z-index: var(--z-index);
  height: var(--height);
  opacity: var(--opacity);
  will-change: translate, opacity, scale;
  transition:
    translate 400ms,
    scale 400ms,
    opacity 400ms,
    height 400ms;
  transition-timing-function: cubic-bezier(0.21, 1.02, 0.73, 1);
}

[data-scope='toast'][data-part='root'][data-state='closed'] {
  transition:
    translate 400ms,
    scale 400ms,
    opacity 200ms;
  transition-timing-function: cubic-bezier(0.06, 0.71, 0.55, 1);
}

/* Mobile responsive */
@media (max-width: 640px) {
  [data-scope='toast'][data-part='group'] {
    width: 100%;
  }

  [data-scope='toast'][data-part='root'] {
    inset-inline: 0;
    width: calc(100% - var(--gap) * 2);
  }
}
</style>
