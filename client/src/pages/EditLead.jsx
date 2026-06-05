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
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 border border-slate-700 rounded-lg transition-colors hover:bg-slate-700"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Edit Lead</h1>
          <p className="text-sm text-slate-400">Modify properties or pipeline position of the lead</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl">
          <LoadingSkeleton rows={5} />
        </div>
      ) : notFound ? (
        <div className="bg-slate-800 border border-slate-750 p-8 rounded-xl flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-red-500/10 text-red-400 mb-4 animate-bounce">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Lead Not Found</h3>
          <p className="text-slate-450 mt-2 max-w-md">
            The lead you are looking for might have been deleted, or the identifier is incorrect.
          </p>
          <button
            onClick={() => navigate('/leads')}
            className="mt-6 px-5 py-2.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-655 font-semibold text-sm transition-colors"
          >
            Back to Leads
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <LeadForm
            initialData={lead}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/leads')}
            loading={submitting}
          />
        </div>
      )}
    </div>
  );
};

export default EditLead;
