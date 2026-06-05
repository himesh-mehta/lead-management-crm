import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Building2, Globe, Calendar, MessageSquare,
  Edit2, Trash2, ShieldCheck, HelpCircle, Clock, Send, Award
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
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

          {lead.status !== 'Converted' && (
            <button
              onClick={() => handleStatusChange('Converted')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md active:scale-95 transition-all"
            >
              <ShieldCheck size={14} />
              <span>Convert Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: notes timelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notes Form */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-500" />
              <span>Log Client Communication</span>
            </h3>

            <form onSubmit={handleNoteSubmit} className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log outcome of discovery calls, budget negotiations, follow-ups..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-850 rounded-xl text-xs bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim() || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Send size={12} />
                  <span>Log Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Vertical Notes Timeline */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Notes & Interactions Timeline</h3>
            
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

        {/* Right column: firmographics and pipeline control */}
        <div className="space-y-6">
          
          {/* Quick status transition controls */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white mb-4">Pipeline Status Transition</h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { status: 'New', color: 'hover:border-blue-500 hover:text-blue-500' },
                { status: 'Contacted', color: 'hover:border-amber-500 hover:text-amber-500' },
                { status: 'Qualified', color: 'hover:border-purple-500 hover:text-purple-500' },
                { status: 'Converted', color: 'hover:border-emerald-500 hover:text-emerald-500' },
                { status: 'Lost', color: 'hover:border-red-500 hover:text-red-500' },
              ].map(item => {
                const isActive = lead.status === item.status;
                return (
                  <button
                    key={item.status}
                    onClick={() => handleStatusChange(item.status as LeadStatus)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-650 dark:text-indigo-400 font-bold'
                        : `border-gray-150 dark:border-slate-800 text-gray-600 dark:text-slate-450 bg-transparent ${item.color}`
                    }`}
                  >
                    <span>{item.status}</span>
                    {isActive && <ShieldCheck size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Firmographic Company Information */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-gray-955 dark:text-white flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              <span>Firmographics</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <Globe size={15} className="text-gray-450" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Corporate Site</p>
                  <a href={`https://${companyInfo.domain}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    {companyInfo.domain}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 size={15} className="text-gray-455" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Company Size</p>
                  <p className="text-gray-700 dark:text-slate-300">{companyInfo.employees}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award size={15} className="text-gray-450" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Funding Round</p>
                  <p className="text-gray-700 dark:text-slate-300">{companyInfo.funding}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-gray-450" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Registered Location</p>
                  <p className="text-gray-700 dark:text-slate-300">{companyInfo.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact coordinates list */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">Contact Info</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Direct Email</p>
                  <a href={`mailto:${lead.email}`} className="text-indigo-650 dark:text-indigo-400 hover:underline">{lead.email}</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={15} className="text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Direct Phone</p>
                  <a href={`tel:${lead.phone}`} className="text-indigo-650 dark:text-indigo-400 hover:underline">{lead.phone}</a>
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
