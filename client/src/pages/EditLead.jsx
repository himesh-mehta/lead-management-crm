import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLead, updateLead } from '../services/api';
import LeadForm from '../components/LeadForm';
import LoadingSkeleton from '../components/LoadingSkeleton';

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchLeadDetails = async () => {
      try {
        const data = await getLead(id);
        if (data && data.lead) {
          setLead(data.lead);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error(error);
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load lead details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateLead(id, formData);
      toast.success('Lead updated successfully!');
      navigate('/leads');
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to update lead';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
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
            <span style={{ color: '#000000', fontWeight: 500 }}>Edit</span>
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
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: 0 }}>Edit Lead</h1>
          </div>
        </div>

        {loading ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 4, padding: 24 }}>
            <LoadingSkeleton rows={5} />
          </div>
        ) : notFound ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textCenter: 'center',
            }}
          >
            <div
              style={{
                padding: 12,
                borderRadius: '50%',
                background: '#F3F3F3',
                color: '#000000',
                marginBottom: 16,
                border: '1px solid #E5E5E5',
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#000000', margin: '0 0 8px 0' }}>Lead Not Found</h3>
            <p style={{ fontSize: 13, color: '#888888', margin: '0 0 20px 0', maxWidth: 400, textAlign: 'center' }}>
              The lead you are looking for might have been deleted, or the identifier is incorrect.
            </p>
            <button
              onClick={() => navigate('/leads')}
              style={{
                padding: '8px 16px',
                background: '#FAFAFA',
                border: '1px solid #E5E5E5',
                borderRadius: 4,
                color: '#000000',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Back to Leads
            </button>
          </div>
        ) : (
          <div>
            <LeadForm
              initialData={lead}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/leads')}
              loading={submitting}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLead;
