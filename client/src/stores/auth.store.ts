import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/api/auth.api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userInitials = computed(() => {
    if (!user.value) return '';
    return user.value.username.substring(0, 2).toUpperCase();
  });

  // Actions
  function setTokens(access: string, refresh: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  function setUser(userData: User) {
    user.value = userData;
  }

  function login(userData: User, access: string, refresh: string) {
    setUser(userData);
    setTokens(access, refresh);
  }

  function logout() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData };
    }
  }

  async function fetchCurrentUser() {
    try {
      if (!accessToken.value) return;
      const response = await authApi.getCurrentUser();
      // The API returns { success: true, data: user }
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Optional: logout if token is invalid
      // logout();
    }
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    // Getters
    isAuthenticated,
    userInitials,
    // Actions
    setTokens,
    setUser,
    login,
    logout,
    updateUser,
    fetchCurrentUser,
  };
});
