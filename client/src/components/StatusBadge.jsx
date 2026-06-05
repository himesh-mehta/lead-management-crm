import React from 'react';

const StatusBadge = ({ status }) => {
  const getColors = (statusName) => {
    const normalized = statusName ? statusName.toLowerCase() : '';
    switch (normalized) {
      case 'new':
        return 'bg-blue-950/50 text-blue-400 border border-blue-800/60';
      case 'contacted':
        return 'bg-yellow-950/50 text-yellow-400 border border-yellow-800/60';
      case 'qualified':
        return 'bg-purple-950/50 text-purple-400 border border-purple-800/60';
      case 'converted':
        return 'bg-green-950/50 text-green-400 border border-green-800/60';
      case 'lost':
        return 'bg-red-950/50 text-red-400 border border-red-800/60';
      default:
        return 'bg-slate-950/50 text-slate-400 border border-slate-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getColors(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
