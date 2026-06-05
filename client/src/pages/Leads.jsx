import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, UserPlus, Filter, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteLead } from '../services/api';
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
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total registered leads:{' '}
            <span className="text-indigo-600 font-bold">{total}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/leads/add')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <UserPlus size={16} />
          Add New Lead
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
        <div className="w-full md:flex-1">
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Filter size={15} />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="block w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
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
            className="p-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Refresh directory"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton rows={6} />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6">
            <div className="p-4 bg-gray-100 border border-gray-200 rounded-full text-gray-400 mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Leads Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Start expanding your customer pool. Register a lead by pressing the button below.
            </p>
            <button
              onClick={() => navigate('/leads/add')}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add New Lead
            </button>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4 hidden md:table-cell">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50 transition-colors duration-150 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                            {lead.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{lead.company}</td>
                      <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">{formatDate(lead.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/leads/edit/${lead.id}`)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            title="Edit lead"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(lead.id);
                              setDeleteOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete lead"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors duration-150 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                        {lead.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{lead.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{lead.company}</p>
                      </div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 pl-10">
                    <p>{lead.email}</p>
                    <p>{lead.phone}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/leads/edit/${lead.id}`)}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-300 bg-white rounded-lg text-gray-700 flex items-center gap-1 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(lead.id);
                        setDeleteOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold border border-red-200 bg-red-50 text-red-600 rounded-lg flex items-center gap-1 hover:bg-red-100 transition-colors duration-200"
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
