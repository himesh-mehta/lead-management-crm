import { useState, useCallback } from 'react';
import { getLeads } from '../services/api';

/**
 * Custom hook to manage leads state, fetching, pagination, and reload.
 */
export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastParams, setLastParams] = useState({});

  const fetchLeads = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    setLastParams(params);
    try {
      const data = await getLeads(params);
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchLeads(lastParams);
  }, [fetchLeads, lastParams]);

  return {
    leads,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    fetchLeads,
    refetch,
  };
};

export default useLeads;
