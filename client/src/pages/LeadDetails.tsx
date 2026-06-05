import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Building2, Globe, Calendar, MessageSquare,
  Edit2, Trash2, ShieldCheck, HelpCircle, Clock, Send, Award, Users, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeadDetailsQuery, useUpdateLeadMutation, useDeleteLeadMutation } from '../hooks/useLeads';
import { LeadStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import LeadModal from '../components/LeadModal';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate, getAvatarUrl } from '../utils/helpers';

interface NoteEntry {
  text: string;
  date: string;
}

const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [newNote, setNewNote] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Queries
  const { data, isLoading, error } = useLeadDetailsQuery(id);
  const updateMutation = useUpdateLeadMutation();
  const deleteMutation = useDeleteLeadMutation();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-250 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-96 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.lead) {
    return (
      <div className="p-16 text-center">
        <HelpCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lead Not Found</h3>
        <p className="text-xs text-gray-500 mt-1">This record might have been deleted or does not exist.</p>
        <button onClick={() => navigate('/leads')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Directory
        </button>
      </div>
    );
  }

  const lead = data.lead;

  // Chronological multi-note timeline retrieval
  let notesTimeline: NoteEntry[] = [];
  try {
    if (lead.notes && (lead.notes.startsWith('[') || lead.notes.startsWith('{'))) {
      notesTimeline = JSON.parse(lead.notes);
    } else if (lead.notes) {
      notesTimeline = [{ text: lead.notes, date: lead.createdAt }];
    }
  } catch (e) {
    notesTimeline = lead.notes ? [{ text: lead.notes, date: lead.createdAt }] : [];
  }

  // Handle status update
  const handleStatusChange = (newStatus: LeadStatus) => {
    updateMutation.mutate({
      id: lead.id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast.success(`Pipeline status updated to ${newStatus}`);
      },
      onError: () => {
        toast.error('Failed to change status');
      }
    });
  };

  // Handle Note submit
  const handleNoteSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: NoteEntry = {
      text: newNote.trim(),
      date: new Date().toISOString()
    };

    const updatedTimeline = [newEntry, ...notesTimeline];
    
    updateMutation.mutate({
      id: lead.id,
      data: { notes: JSON.stringify(updatedTimeline) }
    }, {
      onSuccess: () => {
        toast.success('Communication note added');
        setNewNote('');
      },
      onError: () => {
        toast.error('Failed to submit note');
      }
    });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(lead.id, {
      onSuccess: () => {
        toast.success('Lead deleted successfully');
        navigate('/leads');
      },
      onError: () => {
        toast.error('Failed to delete lead');
      }
    });
  };

  // Mocked firmographics
  const companyInfo = {
    employees: lead.id % 2 === 0 ? '50-100 employees' : '10-50 employees',
    funding: lead.status === 'Converted' ? 'Series B / VC Funded' : lead.id % 3 === 0 ? 'Series A' : 'Bootstrapped',
    location: lead.id % 2 === 0 ? 'San Francisco, CA' : 'New York, NY',
    domain: `${lead.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/leads')}
            className="p-2 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-500 dark:text-slate-400"
          >
            <ArrowLeft size={16} />
          </button>
          
          <img src={getAvatarUrl(lead.name, lead.gender)} alt="" className="w-11 h-11 rounded-full border border-gray-150 shadow-sm flex-shrink-0" />
          
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>{lead.name}</span>
              <StatusBadge status={lead.status} />
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Registered {formatDate(lead.createdAt)} • Source: {lead.source || 'Web'}
            </p>
          </div>
        </div>

        {/* Toolbar actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-250 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850 rounded-xl transition-all"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-650 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl transition-all"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left column: notes timelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notes Form */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-500" />
              <span>Log Client Communication</span>
            </h3>

            <form onSubmit={handleNoteSubmit} className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleNoteSubmit();
                  }
                }}
                placeholder="Log outcome of discovery calls, budget negotiations, follow-ups..."
                rows={2}
                className="w-full px-4 py-3 pb-11 border border-gray-200 dark:border-slate-850 rounded-xl text-xs bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="absolute bottom-2 right-2">
                <button
                  type="submit"
                  disabled={!newNote.trim() || updateMutation.isPending}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Send size={12} />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>

          {/* Vertical Notes Timeline */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Notes & Interactions Timeline</h3>
            
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <div className="relative border-l border-gray-100 dark:border-slate-850 pl-5 ml-2.5 space-y-6">
                {notesTimeline.map((note, index) => (
                  <div key={index} className="relative text-xs">
                    <span className="absolute -left-[23.5px] top-1.5 flex h-4 w-4 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 items-center justify-center">
                      <Clock size={10} className="text-gray-400" />
                    </span>

                    <div>
                      <div className="flex justify-between items-center text-gray-450 dark:text-slate-450 mb-1">
                        <span className="font-semibold text-gray-750 dark:text-slate-350">Timeline Entry</span>
                        <span className="text-[10px]">{formatDate(note.date)}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800/80 text-gray-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </div>
                    </div>
                  </div>
                ))}

                {notesTimeline.length === 0 && (
                  <div className="py-8 text-center text-gray-400">
                    No interaction notes registered. Use the panel above to log your first call.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
            {/* Card header bar */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50/60 dark:bg-slate-850">
              <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
                <Phone size={13} className="text-orange-500" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 dark:text-white tracking-wide">Contact Details</h3>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {/* Email */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                  <Mail size={13} className="text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <a href={`mailto:${lead.email}`} className="text-xs text-orange-500 hover:underline font-medium mt-0.5 block truncate">
                    {lead.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                  <Phone size={13} className="text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <a href={`tel:${lead.phone}`} className="text-xs text-orange-500 hover:underline font-medium mt-0.5 block">
                    {lead.phone}
                  </a>
                </div>
              </div>

              {/* Lead Source */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center flex-shrink-0">
                  <Globe size={13} className="text-sky-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lead Source</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300">
                    {lead.source || 'Web'}
                  </span>
                </div>
              </div>

              {/* Registered */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center flex-shrink-0">
                  <Calendar size={13} className="text-rose-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Registered On</p>
                  <p className="text-xs text-gray-700 dark:text-slate-300 mt-0.5">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: pipeline + company */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Quick status transition controls */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">Pipeline Status</h3>
            
            {/* Vertical stepper */}
            <div className="relative">
              {[
                { status: 'New' as LeadStatus,       color: '#3b82f6', bg: 'bg-blue-500',    ring: 'ring-blue-200',    label: 'New Lead',       sub: 'Contact registered' },
                { status: 'Contacted' as LeadStatus, color: '#f59e0b', bg: 'bg-amber-500',   ring: 'ring-amber-200',   label: 'Contacted',      sub: 'Outreach initiated' },
                { status: 'Qualified' as LeadStatus, color: '#8b5cf6', bg: 'bg-purple-500',  ring: 'ring-purple-200',  label: 'Qualified',      sub: 'Budget confirmed' },
                { status: 'Converted' as LeadStatus, color: '#10b981', bg: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Converted',      sub: 'Deal won 🎉' },
                { status: 'Lost' as LeadStatus,      color: '#ef4444', bg: 'bg-red-500',     ring: 'ring-red-200',     label: 'Lost',           sub: 'Deal closed-lost' },
              ].map((item, idx, arr) => {
                const isActive = lead.status === item.status;
                const isLast   = idx === arr.length - 1;
                return (
                  <div key={item.status} className="relative flex gap-3">
                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className="absolute left-[13px] top-7 w-0.5 bottom-0"
                        style={{ backgroundColor: isActive || lead.status === arr[idx + 1]?.status ? item.color + '40' : '#e5e7eb' }}
                      />
                    )}

                    {/* Step indicator */}
                    <button
                      onClick={() => handleStatusChange(item.status)}
                      className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all mt-0.5 ${
                        isActive
                          ? `${item.bg} ring-4 ${item.ring} shadow-md`
                          : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className={`text-[10px] font-extrabold ${ isActive ? 'text-white' : 'text-gray-400 dark:text-slate-500' }`}>
                        {idx + 1}
                      </span>
                    </button>

                    {/* Label block */}
                    <button
                      onClick={() => handleStatusChange(item.status)}
                      className={`flex-1 flex flex-col text-left py-1.5 mb-3 px-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gray-50 dark:bg-slate-800/60 border border-gray-150 dark:border-slate-700'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className={`text-xs font-bold ${ isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400' }`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-0.5">
                        {item.sub}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
            {/* Card header bar */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50/60 dark:bg-slate-850">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                <Building2 size={13} className="text-indigo-500" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 dark:text-white tracking-wide">Company Information</h3>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {/* Company name */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Building2 size={13} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Company Name</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate mt-0.5">{lead.company}</p>
                </div>
              </div>

              {/* Corporate site */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <Globe size={13} className="text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Corporate Site</p>
                  <a
                    href={`https://${companyInfo.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-orange-500 hover:text-orange-600 hover:underline font-medium mt-0.5 block truncate"
                    onClick={e => e.stopPropagation()}
                  >
                    {companyInfo.domain}
                  </a>
                </div>
              </div>

              {/* Company size */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                  <Users size={13} className="text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Company Size</p>
                  <p className="text-xs text-gray-700 dark:text-slate-300 mt-0.5">{companyInfo.employees}</p>
                </div>
              </div>

              {/* Funding round */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                  <Award size={13} className="text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Funding Round</p>
                  <p className="text-xs text-gray-700 dark:text-slate-300 mt-0.5">{companyInfo.funding}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                  <MapPin size={13} className="text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-xs text-gray-700 dark:text-slate-300 mt-0.5">{companyInfo.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Edit lead modal */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(formData) => {
          updateMutation.mutate({ id: lead.id, data: formData }, {
            onSuccess: () => {
              toast.success('Lead updated successfully');
              setModalOpen(false);
            }
          });
        }}
        initialData={lead}
        loading={updateMutation.isPending}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Prospect File"
        message="Are you sure you want to completely erase this contact and notes timeline from the server?"
      />
    </div>
  );
};

export default LeadDetails;
