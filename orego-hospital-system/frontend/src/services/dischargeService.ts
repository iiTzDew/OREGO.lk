import api from './api';
import { Discharge } from '../types';

export const dischargeService = {
  createDischarge: async (dischargeData: any) => {
    const response = await api.post('/discharges/create', dischargeData);
    return response.data;
  },

  getAllDischarges: async () => {
    const response = await api.get('/discharges/');
    return response.data;
  },

  getDischargeById: async (dischargeId: string): Promise<Discharge> => {
    const response = await api.get(`/discharges/${dischargeId}`);
    return response.data;
  },

  updateDischarge: async (dischargeId: string, dischargeData: Partial<Discharge>) => {
    const response = await api.put(`/discharges/${dischargeId}`, dischargeData);
    return response.data;
  },

  approveDischarge: async (dischargeId: string) => {
    const response = await api.post(`/discharges/${dischargeId}/approve`);
    return response.data;
  },
};
