import api from './api';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async (isRead?: boolean, type?: string) => {
    const params = new URLSearchParams();
    if (isRead !== undefined) params.append('is_read', isRead.toString());
    if (type) params.append('type', type);
    
    const response = await api.get(`/notifications/?${params.toString()}`);
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.post(`/notifications/${notificationId}/read/`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read/');
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}/`);
    return response.data;
  },

  createNotification: async (notificationData: any) => {
    const response = await api.post('/notifications/create/', notificationData);
    return response.data;
  },

  broadcastNotification: async (title: string, message: string, role?: string, type?: string) => {
    const response = await api.post('/notifications/broadcast/', {
      title,
      message,
      role,
      type: type || 'general',
    });
    return response.data;
  },
};
