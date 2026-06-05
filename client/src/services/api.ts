import axios from 'axios';
import { Lead, LeadsResponse, QueryParams } from '../types';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const signIn = async (credentials: { email: string; password?: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/signin', credentials);
  return response.data;
};

export const signUp = async (data: { name: string; email: string; password?: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const demoLogin = async (): Promise<AuthResponse> => {
  const response = await api.post('/auth/demo');
  return response.data;
};

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

export const getStats = async (params?: { timeframe?: string; startDate?: string; endDate?: string }): Promise<{ stats: any }> => {
  const response = await api.get('/leads/stats', { params });
  return response.data;
};

export default api;
