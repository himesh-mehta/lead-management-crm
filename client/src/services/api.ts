import axios from 'axios';
import { Lead, LeadsResponse, LeadStats, QueryParams } from '../types';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLeads = async (params?: QueryParams): Promise<LeadsResponse> => {
  const response = await api.get('/leads', { params });
  return response.data;
};

export const getLead = async (id: number | string): Promise<{ lead: Lead }> => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (data: Omit<Lead, 'id' | 'createdAt'>): Promise<{ message: string; lead: Lead }> => {
  const response = await api.post('/leads', data);
  return response.data;
};

export const updateLead = async (id: number | string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<{ message: string; lead: Lead }> => {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
};

export const deleteLead = async (id: number | string): Promise<{ message: string; lead: Lead }> => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

export const searchLeads = async (q: string): Promise<{ leads: Lead[]; total: number }> => {
  const response = await api.get('/leads/search', { params: { q } });
  return response.data;
};

export const getStats = async (): Promise<{ stats: LeadStats }> => {
  const response = await api.get('/leads/stats');
  return response.data;
};

export default api;
