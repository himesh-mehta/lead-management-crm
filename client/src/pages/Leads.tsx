import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, RefreshCw, Edit2, Trash2, Eye, ChevronRight,
  Phone, Mail, Building2, Calendar, Trash, CheckSquare, Square,
  LayoutGrid, List, Globe, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useLeadsQuery, 
  useCreateLeadMutation, 
  useUpdateLeadMutation, 
  useDeleteLeadMutation 
} from '../hooks/useLeads';
import { Lead, LeadStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import LeadModal from '../components/LeadModal';
import EmptyState from '../components/EmptyState';
import { formatDate, getAvatarUrl } from '../utils/helpers';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modal and Delete states
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  // Fetch leads via React Query
  const { data, isLoading, refetch } = useLeadsQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
    sort: sortField,
    q: searchTerm || undefined,
  });

  const leads = data?.leads || [];
  const totalPages = data?.totalPages || 0;

  // Mutation hooks
  const createMutation = useCreateLeadMutation();
  const updateMutation = useUpdateLeadMutation();
  const deleteMutation = useDeleteLeadMutation();

  // Handle auto-open create modal if redirect parameter exists
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditLead(null);
      setModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Reset page filters on search/status change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortField(e.target.value);
    setPage(1);
  };

  // Submit modal (Add or Edit)
  const handleModalSubmit = async (formData: Omit<Lead, 'id' | 'createdAt'>) => {
    if (editLead) {
      updateMutation.mutate(
        { id: editLead.id, data: formData },
        {
          onSuccess: () => {
            toast.success('Lead updated successfully!');
            setModalOpen(false);
          },
          onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to update lead';
            toast.error(msg);
          }
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Lead added successfully!');
          setModalOpen(false);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Failed to create lead';
          toast.error(msg);
        }
      });
    }
  };

  // Delete single lead
  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Lead deleted successfully');
        setDeleteOpen(false);
        setDeleteId(null);
      },
      onError: () => {
        toast.error('Failed to delete lead');
        setDeleteOpen(false);
      }
    });
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(lead => lead.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you absolutely sure you want to delete ${selectedIds.length} leads?`)) return;

    try {
      await Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)));
      toast.success(`Deleted ${selectedIds.length} leads successfully`);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to complete bulk delete operation');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: LeadStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => updateMutation.mutateAsync({ id, data: { status: newStatus } })));
      toast.success(`Updated status to ${newStatus} for ${selectedIds.length} leads`);
      setSelectedIds([]);
      setBulkStatusOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status for some leads');
    }
  };

  // Filter leads client-side additionally if source filter is applied
  const filteredLeads = leads.filter(lead => {
    if (sourceFilter && lead.source !== sourceFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in relative min-h-screen pb-24">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Leads Pipeline Directory
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Qualify contacts, execute status transitions, and audit deals
          </p>
        </div>

        <button
          onClick={() => {
            setEditLead(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all rounded-xl self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Add Lead</span>
        </button>
      </div>

      {leads.length === 0 && searchTerm === '' && statusFilter === '' && !isLoading ? (
        <EmptyState 
          title="No Leads Found" 
          description="Begin logging leads or use the mock data seeder inside System Settings."
          onActionClick={() => {
            setEditLead(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          
          {/* Advanced toolbar */}
          <div className="p-4 border-b border-gray-150 dark:border-slate-800 flex flex-col xl:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
            {/* Search */}
            <div className="relative w-full xl:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search name, email, phone, company..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
              />
            </div>

            {/* View selectors, status, sorting filters */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
              {/* Table/Card View Toggle Buttons */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-750">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-650'}`}
                  title="Table View"
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-650'}`}
                  title="Card View"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs text-gray-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>

              {/* Source filter */}
              <select
                value={sourceFilter}
                onChange={handleSourceChange}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs text-gray-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Sources</option>
                <option value="Web">Web</option>
                <option value="Referral">Referral</option>
                <option value="Cold-Call">Cold-Call</option>
                <option value="Social Media">Social Media</option>
                <option value="Partner">Partner</option>
              </select>

              {/* Sort field */}
              <select
                value={sortField}
                onChange={handleSortChange}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs text-gray-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="created_at">Sort: Created Date</option>
                <option value="name">Sort: Full Name</option>
                <option value="company">Sort: Company</option>
                <option value="status">Sort: Status</option>
              </select>

              <button
                onClick={() => refetch()}
                className="p-2 border border-gray-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-gray-400 hover:text-gray-650 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                title="Refresh leads"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* List Display (Table / Cards) */}
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <Search className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm font-semibold">No leads match the filters</p>
              <p className="text-xs text-gray-400 mt-1">Refine your search queries or toggle status checkboxes.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* DESKTOP TABLE VIEW */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-905/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-150 dark:border-slate-800">
                    <th className="px-6 py-3.5 w-10">
                      <button onClick={handleSelectAll} className="text-gray-400 hover:text-indigo-650">
                        {selectedIds.length === filteredLeads.length ? (
                          <CheckSquare size={16} className="text-indigo-650" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Source</th>
                    <th className="px-6 py-3.5">Contact Details</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                  {filteredLeads.map((lead) => {
                    const isChecked = selectedIds.includes(lead.id);
                    return (
                      <tr 
                        key={lead.id} 
                        className={`hover:bg-gray-50/40 dark:hover:bg-slate-800/40 transition-colors ${
                          isChecked ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <button onClick={() => handleSelectOne(lead.id)} className="text-gray-400 hover:text-indigo-650">
                            {isChecked ? (
                              <CheckSquare size={16} className="text-indigo-650" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                        <td 
                          className="px-6 py-4 font-bold text-gray-900 dark:text-white hover:underline cursor-pointer flex items-center gap-2.5"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          <img src={getAvatarUrl(lead.name, lead.gender)} alt="" className="w-8 h-8 rounded-full border border-gray-150 shadow-sm flex-shrink-0" />
                          <span>{lead.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-750 dark:text-slate-350">{lead.company}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-medium">
                            {lead.source || 'Web'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex items-center gap-1.5"><Mail size={12} /> {lead.email}</div>
                          <div className="flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => navigate(`/leads/${lead.id}`)} 
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              onClick={() => { setEditLead(lead); setModalOpen(true); }} 
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => { setDeleteId(lead.id); setDeleteOpen(true); }} 
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* PREMIUM CARD VIEW */
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/30 dark:bg-slate-900/30">
              {filteredLeads.map((lead) => {
                const isChecked = selectedIds.includes(lead.id);
                return (
                  <div 
                    key={lead.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                      isChecked 
                        ? 'border-indigo-500 bg-indigo-50/5 dark:bg-indigo-950/10' 
                        : 'border-gray-150 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 shadow-soft'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => handleSelectOne(lead.id)} className="text-gray-400 flex-shrink-0">
                          {isChecked ? <CheckSquare size={16} className="text-indigo-650" /> : <Square size={16} />}
                        </button>
                        
                        <img src={getAvatarUrl(lead.name, lead.gender)} alt="" className="w-9 h-9 rounded-full border border-gray-150 shadow-sm flex-shrink-0" />
                        
                        <div>
                          <h4 
                            className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer text-sm leading-tight"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                          >
                            {lead.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 size={11} /> {lead.company}
                          </span>
                        </div>
                      </div>

                      <StatusBadge status={lead.status} />
                    </div>

                    <div className="my-4 space-y-2 text-xs text-gray-500 dark:text-slate-400">
                      <div className="flex items-center gap-2"><Mail size={12} /> {lead.email}</div>
                      <div className="flex items-center gap-2"><Phone size={12} /> {lead.phone}</div>
                      <div className="flex items-center gap-2"><Globe size={12} /> Source: {lead.source || 'Web'}</div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-850">
                      <span className="text-[10px] text-gray-400"><Calendar size={10} className="inline mr-1" />{formatDate(lead.createdAt)}</span>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="p-1 rounded text-gray-400 hover:text-indigo-600"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => { setEditLead(lead); setModalOpen(true); }}
                          className="p-1 rounded text-gray-400 hover:text-indigo-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => { setDeleteId(lead.id); setDeleteOpen(true); }}
                          className="p-1 rounded text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-150 dark:border-slate-800">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Actions drawer */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 z-40 border border-slate-800"
          >
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.length} leads selected
            </span>

            <div className="h-4 w-[1px] bg-slate-800" />

            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center gap-1.5"
                >
                  <span>Update Status</span>
                  <ChevronRight size={12} className={`transform transition-transform ${bulkStatusOpen ? 'rotate-90' : ''}`} />
                </button>

                {bulkStatusOpen && (
                  <div className="absolute bottom-11 right-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl py-1 z-50 flex flex-col w-36">
                    {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleBulkStatusUpdate(status as LeadStatus)}
                        className="px-4 py-2 text-xs text-left hover:bg-slate-800 text-slate-350 hover:text-white"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-750 text-white flex items-center gap-1.5"
              >
                <Trash size={12} />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action FAB on Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          onClick={() => {
            setEditLead(null);
            setModalOpen(true);
          }}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-650/40 active:scale-95 transition-transform"
        >
          <UserPlus size={22} />
        </button>
      </div>

      {/* Lead Add/Edit Overlay Modal */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editLead}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead Record"
        message="Are you absolutely sure you want to delete this lead? This action is permanent and cannot be undone."
      />
    </div>
  );
};

export default Leads;
