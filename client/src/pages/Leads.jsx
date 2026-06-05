import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, UserPlus, Filter, RefreshCw, EyeOff, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteLead, searchLeads } from '../services/api';
import useLeads from '../hooks/useLeads';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDate } from '../utils/helpers';

const Leads = () => {
  const navigate = useNavigate();
  const { leads, loading, total, totalPages, currentPage, fetchLeads, refetch } = useLeads();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchLeads({
        page,
        limit: 10,
        status: statusFilter || undefined,
        sort: 'created_at',
      });
    }
  }, [page, statusFilter, searchTerm, fetchLeads]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLead(deleteId);
      toast.success('Lead deleted successfully');
      refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete lead');
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Leads Directory</h1>
          <p className="text-sm text-slate-400">Total registered leads: <span className="text-indigo-400 font-bold">{total}</span></p>
        </div>
        <button
          onClick={() => navigate('/leads/add')}
          className="bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm px-4.5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 shadow-lg shadow-indigo-650/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <UserPlus size={16} />
          Add New Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-4 border border-slate-700 rounded-xl shadow-md">
        <div className="w-full md:flex-1">
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={16} />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="block w-full pl-9 pr-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2.5 border border-slate-700 bg-slate-900 hover:bg-slate-750 text-slate-350 hover:text-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-650"
            title="Refresh directory"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Leads List Grid */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton rows={6} />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6">
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-full text-slate-500 mb-4">
              <Plus size={32} className="text-slate-405" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No Leads Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Start expanding your customer pool. Register a lead by pressing the button below.
            </p>
            <button
              onClick={() => navigate('/leads/add')}
              className="mt-6 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add New Lead
            </button>
          </div>
        ) : (
          <>
            {/* Tablet & Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 hidden md:table-cell">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-750/30 transition-colors text-slate-200 text-sm">
                      <td className="px-6 py-4 font-semibold text-slate-100">{lead.name}</td>
                      <td className="px-6 py-4 text-slate-350">{lead.company}</td>
                      <td className="px-6 py-4 text-slate-400">{lead.email}</td>
                      <td className="px-6 py-4 text-slate-450 hidden md:table-cell">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">{formatDate(lead.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/leads/edit/${lead.id}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-755 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(lead.id);
                              setDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-405 hover:bg-slate-755 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden divide-y divide-slate-700/50">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-750/10 transition-colors space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{lead.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{lead.company}</p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>{lead.email}</p>
                    <p>{lead.phone}</p>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => navigate(`/leads/edit/${lead.id}`)}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-700 bg-slate-900 rounded-md text-slate-300 flex items-center gap-1 hover:bg-slate-750"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(lead.id);
                        setDeleteOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold border border-red-900 bg-red-950/20 text-red-400 rounded-md flex items-center gap-1 hover:bg-red-900/10"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you absolutely sure you want to delete this lead? This action is permanent and cannot be undone."
      />
    </div>
  );
};

export default Leads;
