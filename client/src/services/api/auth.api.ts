import api from '@/lib/axios';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  avatar?: File;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const apiData = response.data;
    return {
      user: apiData.data,
      accessToken: apiData.token,
      refreshToken: apiData.token, 
    };
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/users/login', data);
    
    const apiData = response.data;
    return {
      user: apiData.data,
      accessToken: apiData.token,
      refreshToken: apiData.token, 
    };
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/users/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get current user 
   */
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};
