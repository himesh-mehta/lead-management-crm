import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead } from '../services/api';
import LeadForm from '../components/LeadForm';

const AddLead = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createLead(formData);
      toast.success('Lead added successfully!');
      navigate('/leads');
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to add lead';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Breadcrumbs & Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888888' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Dashboard</span>
            <span>/</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/leads')}>Leads</span>
            <span>/</span>
            <span style={{ color: '#000000', fontWeight: 500 }}>Add</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <button
              onClick={() => navigate('/leads')}
              style={{
                background: 'none',
                border: 'none',
                color: '#888888',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
              }}
              className="hover:text-[#000000]"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: 0 }}>Add New Lead</h1>
          </div>
        </div>

        {/* Form Container */}
        <div>
          <LeadForm onSubmit={handleSubmit} onCancel={() => navigate('/leads')} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AddLead;
