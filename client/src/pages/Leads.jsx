import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, RefreshCw, Edit2, Trash2, Eye, X, ChevronRight, Check,
  Phone, Mail, Building2, Calendar, ArrowUpDown, Trash, Sparkles, CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteLead, getLead, updateLead, createLead } from '../services/api';
import useLeads from '../hooks/useLeads';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import LeadModal from '../components/LeadModal';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';

const Leads = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { leads, loading, total, totalPages, currentPage, fetchLeads, refetch } = useLeads();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [page, setPage] = useState(1);

  // Modal and drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLead, setDetailLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete modal states
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Bulk action states
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatusMode, setBulkStatusMode] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Trigger add lead modal if redirect query exists
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setModalOpen(true);
      setSelectedLeadForEdit(null);
      // Clean up search param
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Load leads with debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads({
        page,
        limit: 10,
        status: statusFilter || undefined,
        sort: sortField,
        q: searchTerm || undefined
      });
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [page, statusFilter, sortField, searchTerm, fetchLeads]);

  // Reset checkboxes on lead list changes
  useEffect(() => {
    setSelectedIds([]);
  }, [leads]);

  // View details drawer
  const handleViewDetails = async (lead) => {
    setDetailLead(lead);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await getLead(lead.id);
      if (data && data.lead) {
        setDetailLead(data.lead);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load lead logs');
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit Lead Modal (Add or Edit)
  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedLeadForEdit) {
        await updateLead(selectedLeadForEdit.id, formData);
        toast.success('Lead updated successfully!');
      } else {
        await createLead(formData);
        toast.success('Lead created successfully!');
      }
      setModalOpen(false);
      refetch();
      // Update drawer if opened
      if (detailOpen && detailLead?.id === selectedLeadForEdit?.id) {
        setDetailLead({ ...detailLead, ...formData });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save lead information';
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete single lead
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteLead(deleteId);
      toast.success('Lead deleted successfully');
      if (detailLead?.id === deleteId) {
        setDetailOpen(false);
      }
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lead');
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(lead => lead.id));
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Bulk delete leads
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected leads?`)) return;
    
    setBulkUpdating(true);
    try {
      await Promise.all(selectedIds.map(id => deleteLead(id)));
      toast.success(`Deleted ${selectedIds.length} leads successfully!`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete some leads');
    } finally {
      setBulkUpdating(false);
    }
  };

  // Bulk status updates
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all(selectedIds.map(id => updateLead(id, { status: newStatus })));
      toast.success(`Updated status to ${newStatus} for ${selectedIds.length} leads!`);
      setSelectedIds([]);
      setBulkStatusMode(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status for some leads');
    } finally {
      setBulkUpdating(false);
    }
  };

  const toggleSortField = (field) => {
    setSortField(field);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in relative min-h-screen pb-24">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Leads Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Qualify prospects, manage company directories, and monitor statuses
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedLeadForEdit(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all rounded-xl self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Leads Workspace Wrapper */}
      {leads.length === 0 && searchTerm === '' && statusFilter === '' && !loading ? (
        <EmptyState 
          title="No Leads Registered" 
          description="Create your first lead to populate the sales funnel and dashboard metrics."
          onActionClick={() => {
            setSelectedLeadForEdit(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-150 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search name, email, company..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm text-gray-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortField}
                onChange={(e) => toggleSortField(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm text-gray-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="created_at">Sort: Created Date</option>
                <option value="name">Sort: Name</option>
                <option value="company">Sort: Company</option>
                <option value="status">Sort: Status</option>
              </select>

              <button
                onClick={() => refetch()}
                className="p-2 border border-gray-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-gray-400 hover:text-gray-650 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Eye className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm font-semibold">No results match your criteria</p>
              <p className="text-xs text-gray-450 mt-1">Try refining your search queries or active filters.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-900/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-150 dark:border-slate-800">
                      <th className="px-6 py-3.5 w-10">
                        <button onClick={handleSelectAll} className="text-gray-400 hover:text-indigo-650">
                          {selectedIds.length === leads.length ? (
                            <CheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Company</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Contact</th>
                      <th className="px-6 py-3.5">Created</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                    {leads.map((lead) => {
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
                                <CheckSquare size={16} className="text-indigo-600" />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white hover:underline cursor-pointer" onClick={() => handleViewDetails(lead)}>
                            {lead.name}
                          </td>
                          <td className="px-6 py-4 text-gray-650 dark:text-slate-350">{lead.company}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 space-y-0.5">
                            <div className="flex items-center gap-1.5"><Mail size={12} /> {lead.email}</div>
                            <div className="flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400">
                            {formatDate(lead.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleViewDetails(lead)} 
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                                title="View details"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => { setSelectedLeadForEdit(lead); setModalOpen(true); }} 
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                                title="Edit Lead"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => { setDeleteId(lead.id); setDeleteOpen(true); }} 
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                title="Delete Lead"
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

              {/* MOBILE RESPONSIVE CARD LIST */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                {leads.map((lead) => {
                  const isChecked = selectedIds.includes(lead.id);
                  return (
                    <div 
                      key={lead.id} 
                      className={`p-4 space-y-3 transition-colors ${
                        isChecked ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleSelectOne(lead.id)} className="text-gray-400">
                            {isChecked ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                          </button>
                          <div>
                            <h4 
                              className="font-bold text-gray-900 dark:text-white text-sm"
                              onClick={() => handleViewDetails(lead)}
                            >
                              {lead.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{lead.company}</p>
                          </div>
                        </div>

                        <StatusBadge status={lead.status} />
                      </div>

                      <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1 pl-7">
                        <div className="flex items-center gap-1.5"><Mail size={12} /> {lead.email}</div>
                        <div className="flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</div>
                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(lead.created_at)}</div>
                      </div>

                      {/* Card actions */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 dark:border-slate-850">
                        <button 
                          onClick={() => handleViewDetails(lead)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button 
                          onClick={() => { setSelectedLeadForEdit(lead); setModalOpen(true); }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => { setDeleteId(lead.id); setDeleteOpen(true); }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 transition-all flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table pagination footer */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-150 dark:border-slate-800">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Bulk Action Indicator Banner */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-40 border border-slate-850 animate-scale-in">
          <span className="text-xs font-bold text-slate-200">
            {selectedIds.length} leads selected
          </span>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            {/* Status updates */}
            <div className="relative">
              <button 
                onClick={() => setBulkStatusMode(!bulkStatusMode)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center gap-1"
              >
                <span>Update Status</span>
                <ChevronRight size={12} className={`transform transition-transform ${bulkStatusMode ? 'rotate-90' : ''}`} />
              </button>

              {bulkStatusMode && (
                <div className="absolute bottom-11 right-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl py-1 z-50 flex flex-col w-36">
                  {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleBulkStatusUpdate(status)}
                      className="px-4 py-2 text-xs text-left hover:bg-slate-800 text-slate-350 hover:text-white"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk Delete button */}
            <button
              onClick={handleBulkDelete}
              disabled={bulkUpdating}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-750 text-white flex items-center gap-1 disabled:opacity-50"
            >
              <Trash size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Lead details interactive Side drawer Sheet */}
      {detailOpen && detailLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setDetailOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-gray-150 dark:border-slate-800 z-51 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-950 dark:text-white text-sm">Lead Details Sheet</h3>
              <button 
                onClick={() => setDetailOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            {detailLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-100 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                <div className="h-24 bg-gray-50 dark:bg-slate-900 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Client Avatar / Name */}
                <div className="flex items-center gap-4 border-b border-gray-50 dark:border-slate-850 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xl border border-indigo-100/50 dark:border-indigo-900/30">
                    {detailLead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug">{detailLead.name}</h4>
                    <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Building2 size={13} /> {detailLead.company}
                    </span>
                  </div>
                </div>

                {/* Status Badge Info */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Current Pipeline Status</span>
                  <div className="pt-1">
                    <StatusBadge status={detailLead.status} />
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Contact Details</span>
                  
                  <div className="space-y-2">
                    <a 
                      href={`mailto:${detailLead.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900 bg-gray-50/30 dark:bg-slate-900/20 text-xs text-gray-700 dark:text-slate-350 transition-all"
                    >
                      <Mail className="text-indigo-500" size={15} />
                      <div className="flex-1 truncate">
                        <p className="font-semibold text-gray-900 dark:text-slate-200">Email Address</p>
                        <p className="mt-0.5 truncate">{detailLead.email}</p>
                      </div>
                    </a>

                    <a 
                      href={`tel:${detailLead.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900 bg-gray-50/30 dark:bg-slate-900/20 text-xs text-gray-700 dark:text-slate-350 transition-all"
                    >
                      <Phone className="text-indigo-500" size={15} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-slate-200">Phone Number</p>
                        <p className="mt-0.5">{detailLead.phone}</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Notes logs */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Lead Interaction Notes</span>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-850 text-xs text-gray-650 dark:text-slate-350 border border-gray-100 dark:border-slate-800/80 leading-relaxed whitespace-pre-line">
                    {detailLead.notes || <span className="italic text-gray-400">No communication notes logged for this client contact.</span>}
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 dark:border-slate-850 pt-5">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Created {formatDate(detailLead.created_at)}</span>
                </div>
              </div>
            )}

            {/* Drawer footer actions */}
            {!detailLoading && (
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex gap-3">
                <button
                  onClick={() => { setSelectedLeadForEdit(detailLead); setModalOpen(true); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                >
                  <Edit2 size={13} />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => { setDeleteId(detailLead.id); setDeleteOpen(true); }}
                  className="inline-flex items-center justify-center p-2.5 text-xs font-semibold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reusable Lead Add/Edit Overlay Modal */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedLeadForEdit}
        loading={modalLoading}
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
