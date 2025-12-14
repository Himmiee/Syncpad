import { inject } from 'vue'
import type { CreateToasterReturn } from '@ark-ui/vue'

export function useToast() {
  const toaster = inject<CreateToasterReturn>('toaster')

  if (!toaster) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return {
    success: (title: string, description?: string) => {
      toaster.success({ title, description })
    },

    error: (title: string, description?: string) => {
      toaster.error({ title, description })
    },

    warning: (title: string, description?: string) => {
      toaster.warning({ title, description })
    },

    info: (title: string, description?: string) => {
      toaster.info({ title, description })
    },

    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: { title: string; description?: string }
        success: { title: string; description?: string }
        error: { title: string; description?: string }
      }
    ) => {
      return toaster.promise(promise, options)
    },

    // Access to raw toaster for advanced usage
    toaster,
  }
}
