import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Phone, Building2, Tag, FileText, Globe } from 'lucide-react';
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
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-150 animate-scale-in flex flex-col my-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {initialData ? 'Edit Lead Record' : 'Add New Prospect'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-850 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form contents */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
                <option value="New">New</option>
                <option value="Qualified">Qualified</option>
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

          {/* Footer controls inside modal */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-50 dark:bg-slate-800 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-75"
              style={{ backgroundColor: '#ff7a59' }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5431c')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ff7a59')}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{loading ? 'Processing...' : initialData ? 'Update Lead' : 'Create Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
