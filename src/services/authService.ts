import { api } from './api';
import { User } from '@types/index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Verify phone number
  verifyPhone: async (phone: string, code: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/auth/verify-phone', {
      phone,
      code,
    });
    return response.data;
  },

  // Request phone verification code
  requestPhoneVerification: async (phone: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/send-verification', { phone });
    return response.data;
  },
};
