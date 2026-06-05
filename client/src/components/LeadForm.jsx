import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const LeadForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        status: initialData.status || 'New',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const [focusedField, setFocusedField] = useState('');

  const inputStyle = (field) => ({
    width: '100%',
    padding: '8px 12px',
    background: '#FFFFFF',
    border: `1px solid ${errors[field] ? '#000000' : focusedField === field ? '#000000' : '#E5E5E5'}`,
    borderRadius: 4,
    color: '#000000',
    fontSize: 13,
    outline: 'none',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(0,0,0,0.06)' : 'none',
    transition: 'all 0.15s ease',
  });

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 4,
        padding: '24px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        maxWidth: 768,
        margin: '0 auto',
      }}
    >
      {/* SECTION 1: Contact Information */}
      <h3
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#888888',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #E5E5E5',
          paddingBottom: 6,
          marginBottom: 16,
        }}
      >
        Contact Information
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField('')}
            placeholder="John Doe"
            style={inputStyle('name')}
          />
          {errors.name && <p style={{ color: '#000000', fontWeight: 'bold', fontSize: 11, marginTop: 4, marginBlockEnd: 0 }}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
            placeholder="johndoe@example.com"
            style={inputStyle('email')}
          />
          {errors.email && <p style={{ color: '#000000', fontWeight: 'bold', fontSize: 11, marginTop: 4, marginBlockEnd: 0 }}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
            Phone Number *
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField('')}
            placeholder="+1 (555) 000-0000"
            style={inputStyle('phone')}
          />
          {errors.phone && <p style={{ color: '#000000', fontWeight: 'bold', fontSize: 11, marginTop: 4, marginBlockEnd: 0 }}>{errors.phone}</p>}
        </div>

        {/* Company */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
            Company Name *
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            onFocus={() => setFocusedField('company')}
            onBlur={() => setFocusedField('')}
            placeholder="Acme Corp"
            style={inputStyle('company')}
          />
          {errors.company && <p style={{ color: '#000000', fontWeight: 'bold', fontSize: 11, marginTop: 4, marginBlockEnd: 0 }}>{errors.company}</p>}
        </div>
      </div>

      {/* SECTION 2: Lead Details */}
      <h3
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#888888',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #E5E5E5',
          paddingBottom: 6,
          marginBottom: 16,
        }}
      >
        Lead Details
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
            Pipeline Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            onFocus={() => setFocusedField('status')}
            onBlur={() => setFocusedField('')}
            style={inputStyle('status')}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#000000', marginBottom: 6 }}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            onFocus={() => setFocusedField('notes')}
            onBlur={() => setFocusedField('')}
            rows={4}
            placeholder="Add any additional lead context..."
            style={{
              ...inputStyle('notes'),
              resize: 'none',
            }}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          gap: 12,
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #E5E5E5',
        }}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              color: '#000000',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            className="hover:bg-[#FAFAFA]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 24px',
            background: '#000000',
            border: 'none',
            borderRadius: 4,
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease',
          }}
          className="hover:bg-[#222222]"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          <span>{loading ? 'Processing...' : initialData ? 'Save Changes' : 'Add Lead'}</span>
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
