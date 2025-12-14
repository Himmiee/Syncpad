import { createToaster } from '@ark-ui/vue/toast'

export const toaster = createToaster({
  placement: 'bottom-end',
  overlap: true,
  gap: 16,
  duration: 5000,
  max: 3,
})

// Helper methods for different toast types
export const toast = {
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
}
