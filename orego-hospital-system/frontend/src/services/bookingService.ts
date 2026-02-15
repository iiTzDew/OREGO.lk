import api from './api';
import { Booking } from '../types';

export const bookingService = {
  createBooking: async (bookingData: any) => {
    const response = await api.post('/bookings/create', bookingData);
    return response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/bookings/');
    return response.data;
  },

  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  completeBooking: async (bookingId: string) => {
    const response = await api.post(`/bookings/${bookingId}/complete`);
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
};
