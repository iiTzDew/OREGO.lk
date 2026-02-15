import api from './api';
import { Resource } from '../types';

export const resourceService = {
  registerResource: async (resourceData: any) => {
    const response = await api.post('/resources/register', resourceData);
    return response.data;
  },

  getAllResources: async (type?: string, status?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const response = await api.get(`/resources/?${params.toString()}`);
    return response.data;
  },

  getResourceById: async (resourceId: string): Promise<Resource> => {
    const response = await api.get(`/resources/${resourceId}`);
    return response.data;
  },

  updateResource: async (resourceId: string, resourceData: Partial<Resource>) => {
    const response = await api.put(`/resources/${resourceId}`, resourceData);
    return response.data;
  },

  deleteResource: async (resourceId: string) => {
    const response = await api.delete(`/resources/${resourceId}`);
    return response.data;
  },

  getAvailableResources: async (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await api.get(`/resources/available?${params.toString()}`);
    return response.data;
  },

  getBeds: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get(`/resources/beds?${params.toString()}`);
    return response.data;
  },

  getOperationTheatres: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get(`/resources/operation-theatres?${params.toString()}`);
    return response.data;
  },

  getMachines: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get(`/resources/machines?${params.toString()}`);
    return response.data;
  },
};
