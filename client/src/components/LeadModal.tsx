import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Phone, Building2, Tag, FileText, Globe, DollarSign } from 'lucide-react';
import { Lead, LeadStatus } from '../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, 'id' | 'createdAt'>) => void;
  initialData?: Lead | null;
  loading?: boolean;
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New' as LeadStatus,
    source: 'Web',
    notes: '',
    gender: 'Male' as 'Male' | 'Female',
    estimatedValue: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        status: initialData.status || 'New',
        source: initialData.source || 'Web',
        notes: initialData.notes || '',
        gender: (initialData.gender as 'Male' | 'Female') || 'Male',
        estimatedValue: initialData.estimatedValue || 0,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'New',
        source: 'Web',
        notes: '',
        gender: 'Male',
        estimatedValue: 0,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    /* Outer — covers full screen, centers modal */
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 16px' }}
    >
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(30,30,40,0.45)' }}
        onClick={onClose}
      />

      {/* Modal box — never taller than the viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '512px',
          maxHeight: 'calc(100vh - 76px)',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Header — never scrolls away */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {initialData ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body — min-height:0 is REQUIRED for flex+overflow to work */}
        <form
          id="lead-modal-form"
          onSubmit={handleSubmit}
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1, minHeight: 0 }}
        >

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User size={16} />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                placeholder="Tony Stark"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-xs transition-all focus:outline-none focus:ring-2 dark:text-white ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : focusedField === 'name'
                      ? 'border-indigo-500 focus:ring-indigo-500/20'
                      : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                placeholder="tony@stark.industries"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-xs transition-all focus:outline-none focus:ring-2 dark:text-white ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : focusedField === 'email'
                      ? 'border-indigo-500 focus:ring-indigo-500/20'
                      : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone & Company grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  placeholder="+1 (555) Stark-01"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-xs transition-all focus:outline-none focus:ring-2 dark:text-white ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'phone'
                        ? 'border-indigo-500 focus:ring-indigo-500/20'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Building2 size={16} />
                </span>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('company')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Stark Industries"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-xs transition-all focus:outline-none focus:ring-2 dark:text-white ${
                    errors.company 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : focusedField === 'company'
                        ? 'border-indigo-500 focus:ring-indigo-500/20'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                />
              </div>
              {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
            </div>
          </div>

          {/* Pipeline Status & Lead Source & Gender grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Tag size={12} />
                Pipeline Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onFocus={() => setFocusedField('status')}
                onBlur={() => setFocusedField('')}
                className="crm-select w-full"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Globe size={12} />
                Lead Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                onFocus={() => setFocusedField('source')}
                onBlur={() => setFocusedField('')}
                className="crm-select w-full"
              >
                <option value="Cold-Call">Cold Calling</option>
                <option value="Partner">External Partner</option>
                <option value="Referral">Referral Contract</option>
                <option value="Social Media">Social Media</option>
                <option value="Web">Web Intake</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User size={12} />
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onFocus={() => setFocusedField('gender')}
                onBlur={() => setFocusedField('')}
                className="crm-select w-full"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <DollarSign size={12} />
              Estimated Deal Value ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <DollarSign size={16} />
              </span>
              <input
                type="number"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleChange}
                onFocus={() => setFocusedField('estimatedValue')}
                onBlur={() => setFocusedField('')}
                placeholder="e.g. 5000"
                min="0"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-xs transition-all focus:outline-none focus:ring-2 dark:text-white ${
                  focusedField === 'estimatedValue'
                    ? 'border-indigo-500 focus:ring-indigo-500/20'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
              Interaction Notes
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-gray-400">
                <FileText size={16} />
              </span>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onFocus={() => setFocusedField('notes')}
                onBlur={() => setFocusedField('')}
                rows={3}
                placeholder="budget, timeline, critical deal notes..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-xs transition-all focus:outline-none focus:ring-2 dark:text-white resize-none ${
                  focusedField === 'notes'
                    ? 'border-indigo-500 focus:ring-indigo-500/20'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              />
            </div>
          </div>

        </form>

        {/* Footer — always visible, never scrolls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', borderTop: '1px solid #f3f4f6', flexShrink: 0, borderRadius: '0 0 16px 16px', background: '#fff' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#374151', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Cancel
          </button>
          <button
            form="lead-modal-form"
            type="submit"
            disabled={loading}
            style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 700, color: '#fff', background: '#ff7a59', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(255,122,89,0.3)' }}
            onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#e5431c')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#ff7a59')}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>{loading ? 'Processing...' : initialData ? 'Update Lead' : 'Create Lead'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;

