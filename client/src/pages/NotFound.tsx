import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-55 dark:bg-slate-950 px-4 py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 mb-6 animate-bounce">
        <HelpCircle size={28} />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
        The workspace path you are trying to access does not exist or has been relocated.
      </p>

      <button
        onClick={() => navigate('/')}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
      >
        <ArrowLeft size={14} />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

export default NotFound;
