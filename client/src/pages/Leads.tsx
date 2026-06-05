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
import CrmSelect from '../components/CrmSelect';
import { formatDate, getAvatarUrl } from '../utils/helpers';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortField, setSortField] = useState('name');
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

  // Newly added lead highlight
  const [newLeadId, setNewLeadId] = useState<number | null>(null);

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
        onSuccess: (created: any) => {
          toast.success('Lead added successfully!');
          setModalOpen(false);
          // Highlight the new row for 3 seconds
          if (created?.id) {
            setNewLeadId(created.id);
            setTimeout(() => setNewLeadId(null), 3000);
          }
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
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-150">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Leads Pipeline Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Qualify contacts, execute status transitions, and audit deals
          </p>
        </div>

        <button
          onClick={() => {
            setEditLead(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white rounded-xl self-start sm:self-center transition-all active:scale-[0.98] shadow-md"
          style={{ backgroundColor: '#ff7a59' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e5431c')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ff7a59')}
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
        <div className="bg-white border border-gray-150 rounded-2xl shadow-soft overflow-hidden">
          
          {/* Advanced toolbar */}
          <div className="p-4 border-b border-gray-150 flex flex-col xl:flex-row gap-3 items-center justify-between bg-gray-50/50">
            {/* Search */}
            <div className="relative w-full xl:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search name, email, phone, company..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-xs focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            {/* View selectors, status, sorting filters */}
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
              {/* Table/Card View Toggle Buttons */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Table View"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Card View"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>

              {/* Status filter */}
              <CrmSelect
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'Contacted', label: 'Contacted' },
                  { value: 'Converted', label: 'Converted' },
                  { value: 'Lost', label: 'Lost' },
                  { value: 'New', label: 'New' },
                  { value: 'Qualified', label: 'Qualified' },
                ]}
              />

              {/* Source filter */}
              <CrmSelect
                value={sourceFilter}
                onChange={(v) => { setSourceFilter(v); setPage(1); }}
                options={[
                  { value: '', label: 'All Sources' },
                  { value: 'Cold-Call', label: 'Cold-Call' },
                  { value: 'Partner', label: 'Partner' },
                  { value: 'Referral', label: 'Referral' },
                  { value: 'Social Media', label: 'Social Media' },
                  { value: 'Web', label: 'Web' },
                ]}
              />

              {/* Sort field */}
              <CrmSelect
                value={sortField}
                onChange={(v) => { setSortField(v); setPage(1); }}
                options={[
                  { value: 'company', label: 'Sort: Company' },
                  { value: 'created_at', label: 'Sort: Created Date' },
                  { value: 'name', label: 'Sort: Full Name' },
                  { value: 'status', label: 'Sort: Status' },
                ]}
              />

              <div className="relative group/tip">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setSourceFilter('');
                    setSortField('name');
                    setPage(1);
                    refetch();
                  }}
                  className="p-2 border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <RefreshCw size={14} />
                </button>
                <div className="action-tooltip whitespace-nowrap">Reset Filters</div>
              </div>
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
              <table className="w-full border-collapse text-left text-xs table-fixed">
                <colgroup>
                  <col style={{ width: '40px' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-150">
                    <th className="px-4 py-3">
                      <button onClick={handleSelectAll} className="text-gray-400 hover:text-orange-500 transition-colors">
                        {selectedIds.length === filteredLeads.length ? (
                          <CheckSquare size={15} className="text-orange-500" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Company</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Source</th>
                    <th className="px-3 py-3">Contact Details</th>
                    <th className="px-3 py-3">Created Date</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => {
                    const isChecked = selectedIds.includes(lead.id);
                    const isNew = lead.id === newLeadId;
                    return (
                      <tr 
                        key={lead.id} 
                        className={`transition-colors ${
                          isNew
                            ? 'new-lead-highlight'
                            : isChecked
                            ? 'bg-orange-50/30 hover:bg-orange-50/50'
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <button onClick={() => handleSelectOne(lead.id)} className="text-gray-400 hover:text-orange-500 transition-colors">
                            {isChecked ? (
                              <CheckSquare size={15} className="text-orange-500" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>
                        <td 
                          className="px-3 py-3 font-bold text-gray-900 hover:underline cursor-pointer"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={getAvatarUrl(lead.name, lead.gender)} alt="" className="w-7 h-7 rounded-full border border-gray-150 shadow-sm flex-shrink-0" />
                            <span className="truncate">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600 truncate">{lead.company}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-gray-600 font-medium whitespace-nowrap">
                            {lead.source || 'Web'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-1.5 truncate"><Mail size={11} className="flex-shrink-0" /> <span className="truncate">{lead.email}</span></div>
                          <div className="flex items-center gap-1.5"><Phone size={11} className="flex-shrink-0" /> {lead.phone}</div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-1">
                            {/* View */}
                            <div className="relative group/tip">
                              <button 
                                onClick={() => navigate(`/leads/${lead.id}`)} 
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                              >
                                <Eye size={13} />
                              </button>
                              <div className="action-tooltip">See Details</div>
                            </div>
                            {/* Edit */}
                            <div className="relative group/tip">
                              <button 
                                onClick={() => { setEditLead(lead); setModalOpen(true); }} 
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                              >
                                <Edit2 size={13} />
                              </button>
                              <div className="action-tooltip">Edit</div>
                            </div>
                            {/* Delete */}
                            <div className="relative group/tip">
                              <button 
                                onClick={() => { setDeleteId(lead.id); setDeleteOpen(true); }} 
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                              <div className="action-tooltip">Delete</div>
                            </div>
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
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 bg-gray-50/40">
              {filteredLeads.map((lead, idx) => {
                const isChecked = selectedIds.includes(lead.id);
                const isNew = lead.id === newLeadId;

                // Status accent colors
                const statusAccent: Record<string, string> = {
                  New:       'from-blue-500 to-blue-400',
                  Contacted: 'from-amber-500 to-amber-400',
                  Qualified: 'from-purple-500 to-purple-400',
                  Converted: 'from-emerald-500 to-emerald-400',
                  Lost:      'from-red-500 to-red-400',
                };
                const accent = statusAccent[lead.status] || 'from-gray-400 to-gray-300';

                return (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className={`card-enter group relative rounded-2xl border overflow-hidden cursor-pointer flex flex-col
                      shadow-sm transition-all duration-300
                      hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-200/80
                      ${ isNew ? 'ring-2 ring-emerald-400 ring-offset-2' : '' }
                      ${ isChecked ? 'border-orange-400 bg-orange-50/30' : 'border-gray-150 bg-white' }`}
                    style={{ animationDelay: `${idx * 45}ms` }}
                  >
                    {/* Coloured top accent bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${accent} flex-shrink-0`} />

                    {/* Card body */}
                    <div className="p-4 flex flex-col gap-3 flex-1">

                      {/* Top row: avatar + name + checkbox */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getAvatarUrl(lead.name, lead.gender)}
                              alt=""
                              className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            />
                            {/* Status dot */}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-gradient-to-br ${accent}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs leading-tight truncate group-hover:text-orange-600 transition-colors">
                              {lead.name}
                            </h4>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                              <Building2 size={9} className="flex-shrink-0" />
                              {lead.company}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectOne(lead.id); }}
                          className="flex-shrink-0 mt-0.5 text-gray-300 hover:text-orange-500 transition-colors"
                        >
                          {isChecked
                            ? <CheckSquare size={15} className="text-orange-500" />
                            : <Square size={15} />}
                        </button>
                      </div>

                      {/* Status badge */}
                      <div>
                        <StatusBadge status={lead.status} />
                      </div>

                      {/* Contact details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Mail size={10} className="text-gray-400" />
                          </div>
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Phone size={10} className="text-gray-400" />
                          </div>
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Globe size={10} className="text-gray-400" />
                          </div>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-gray-600 text-[10px] font-medium">
                            {lead.source || 'Web'}
                          </span>
                        </div>
                      </div>

                      {/* Footer: date + actions */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar size={9} />
                          {formatDate(lead.createdAt)}
                        </span>

                        {/* Action buttons */}
                        <div
                          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition-all"
                            title="View"
                          >
                            <Eye size={11} />
                          </button>
                          <button
                            onClick={() => { setEditLead(lead); setModalOpen(true); }}
                            className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center transition-all"
                            title="Edit"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => { setDeleteId(lead.id); setDeleteOpen(true); }}
                            className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-150">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Actions bar - fixed at top center */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[76px] left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border border-slate-700"
          >
            <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
              {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
            </span>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <span>Update Status</span>
                  <ChevronRight size={12} className={`transform transition-transform ${bulkStatusOpen ? 'rotate-90' : ''}`} />
                </button>

                {bulkStatusOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl py-1 z-50 flex flex-col w-36">
                    {['Contacted', 'Converted', 'Lost', 'New', 'Qualified'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleBulkStatusUpdate(status as LeadStatus)}
                        className="px-4 py-2 text-xs text-left hover:bg-orange-50 hover:text-orange-600 text-gray-700 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors"
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
          className="w-14 h-14 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          style={{ backgroundColor: '#ff7a59' }}
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
