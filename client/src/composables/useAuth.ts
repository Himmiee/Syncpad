import { useMutation } from '@tanstack/vue-query';
import { authApi, type LoginData, type RegisterData } from '@/services/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

/**
 * Login mutation hook
 */
export function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      // Save user and tokens to store
      authStore.login(data.user, data.accessToken, data.refreshToken);
      
      // Redirect to home/notes page
      router.push('/notes');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      // You can add toast notification here
    },
  });
}

/**
 * Register mutation hook
 */
export function useRegister() {
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      // Save user and tokens to store
      authStore.login(data.user, data.accessToken, data.refreshToken);
      
      // Redirect to home/notes page
      router.push('/notes');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      // You can add toast notification here
    },
  });
}

/**
 * Logout mutation hook
 */
export function useLogout() {
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // If you have a logout endpoint on backend, call it here
      // await authApi.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear auth store
      authStore.logout();
      
      // Redirect to login
      router.push('/auth/login');
    },
  });
}
