import api from './api';
import { User } from '../types';

export const userService = {
  registerUser: async (userData: any) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  getAllUsers: async (role?: string, speciality?: string, status?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (speciality) params.append('speciality', speciality);
    if (status) params.append('status', status);
    
    const response = await api.get(`/users/?${params.toString()}`);
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deactivateUser: async (userId: string) => {
    const response = await api.post(`/users/${userId}/deactivate`);
    return response.data;
  },

  activateUser: async (userId: string) => {
    const response = await api.post(`/users/${userId}/activate`);
    return response.data;
  },

  getSpecialities: async () => {
    const response = await api.get('/users/specialities');
    return response.data;
  },

  getDoctors: async () => {
    const response = await api.get('/users/doctors');
    return response.data;
  },

  getNurses: async () => {
    const response = await api.get('/users/nurses');
    return response.data;
  },

  getStaff: async () => {
    const response = await api.get('/users/staff');
    return response.data;
  },

  getPatients: async () => {
    const response = await api.get('/users/patients');
    return response.data;
  },
};
