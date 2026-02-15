import api from './api';
import { LoginCredentials, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  requestPasswordReset: async (username: string) => {
    const response = await api.post('/auth/request-password-reset', { username });
    return response.data;
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      reset_token: resetToken,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
