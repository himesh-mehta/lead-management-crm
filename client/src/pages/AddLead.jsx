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
          <h1 className="text-2xl font-bold text-slate-100">Add New Lead</h1>
          <p className="text-sm text-slate-400">Fill in the form to register a new lead in the pipeline</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mt-4">
        <LeadForm onSubmit={handleSubmit} onCancel={() => navigate('/leads')} loading={loading} />
      </div>
    </div>
  );
};

export default AddLead;
