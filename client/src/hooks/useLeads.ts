import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, getLead, createLead, updateLead, deleteLead, getStats, searchLeads } from '../services/api';
import { Lead, QueryParams } from '../types';

export const useLeadsQuery = (params: QueryParams) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => getLeads(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
};

export const useLeadDetailsQuery = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id!),
    enabled: !!id,
    staleTime: 10000,
  });
};

export const useStatsQuery = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    staleTime: 10000,
  });
};

export const useSearchLeadsQuery = (q: string) => {
  return useQuery({
    queryKey: ['search-leads', q],
    queryFn: () => searchLeads(q),
    enabled: q.trim().length > 0,
    staleTime: 0,
  });
};

// MUTATIONS

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useUpdateLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Omit<Lead, 'id' | 'createdAt'>> }) => 
      updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
};
