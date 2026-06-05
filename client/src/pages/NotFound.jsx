import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-full text-indigo-400 mb-6 shadow-xl animate-pulse">
        <HelpCircle size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Page Not Found</h1>
      <p className="text-slate-400 mt-3 max-w-sm text-sm leading-relaxed">
        The route you are trying to visit does not exist or may have been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-8 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-650/15 flex items-center gap-2 transition-all"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
