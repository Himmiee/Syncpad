import { useMutation } from '@tanstack/vue-query';
import { authApi, type LoginData, type RegisterData } from '@/services/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
import { useToast } from './useToast';
import { getErrorMessage } from '@/lib/helper';

/**
 * Login mutation hook
 */
export function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      // Save user and tokens to store
      authStore.login(data.user, data.accessToken, data.refreshToken);
      
      // Show success message
      toast.success('Welcome back!', `Logged in as ${data.user.username}`);
      
      // Redirect to original page or home
      const redirect = router.currentRoute.value.query.redirect as string;
      router.push(redirect || '/dashboard/notes');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      toast.error(
        'Login failed',
        getErrorMessage(error, 'Invalid email or password')
      );
    },
  });
}

/**
 * Register mutation hook
 */
export function useRegister() {
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      // Save user and tokens to store
      authStore.login(data.user, data.accessToken, data.refreshToken);
      
      // Show success message
      toast.success('Account created!', `Welcome to SyncPad, ${data.user.username}!`);
      
      // Redirect to home/notes page
      router.push('/dashboard/notes');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      toast.error(
        'Registration failed',
        getErrorMessage(error, 'Could not create account. Please try again.')
      );
    },
  });
}

/**
 * Logout mutation hook
 */
export function useLogout() {
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: async () => {
      // If you have a logout endpoint on backend, call it here
      // await authApi.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear auth store
      authStore.logout();
      
      // Show success message
      toast.info('Logged out', 'See you next time!');
      
      // Redirect to login
      router.push('/auth/login');
    },
  });
}

