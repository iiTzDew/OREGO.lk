import api from './api';
import { Hospital } from '../types';

export const hospitalService = {
  createOrUpdateHospital: async (hospitalData: any) => {
    const response = await api.post('/hospital/', hospitalData);
    return response.data;
  },

  getHospital: async (): Promise<Hospital> => {
    const response = await api.get('/hospital/');
    return response.data;
  },

  updateHospital: async (hospitalData: Partial<Hospital>) => {
    const response = await api.put('/hospital/', hospitalData);
    return response.data;
  },
};
