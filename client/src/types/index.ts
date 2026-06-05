export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source?: string | null;
  notes?: string | null;
  gender?: 'Male' | 'Female' | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LeadStats {
  total: number;
  thisMonth: number;
  conversionRate: string;
  byStatus: Record<LeadStatus, number>;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
  q?: string;
}
