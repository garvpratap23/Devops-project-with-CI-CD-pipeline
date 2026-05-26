import client from './client';
import { ApiResponse, User, LoginCredentials, RegisterCredentials } from '../types';

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<ApiResponse> => {
    const { data } = await client.post<ApiResponse>('/auth/register', credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<never> & { user: User }> => {
    const { data } = await client.post<ApiResponse<never> & { user: User }>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<ApiResponse> => {
    const { data } = await client.post<ApiResponse>('/auth/logout');
    return data;
  },

  refresh: async (): Promise<ApiResponse> => {
    const { data } = await client.post<ApiResponse>('/auth/refresh');
    return data;
  },

  getMe: async (): Promise<ApiResponse<never> & { user: User }> => {
    const { data } = await client.get<ApiResponse<never> & { user: User }>('/auth/me');
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const { data } = await client.put<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
