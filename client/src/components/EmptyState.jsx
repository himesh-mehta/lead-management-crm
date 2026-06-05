import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

const EmptyState = ({ title = 'No leads found', description = 'Get started by creating your first lead in the directory.', onActionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-soft animate-fade-in">
      {/* Decorative Icon Wrapper */}
      <div className="relative mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <Sparkles size={28} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
        </span>
      </div>

      {/* Text Info */}
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <Plus size={16} />
          <span>Add Your First Lead</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
