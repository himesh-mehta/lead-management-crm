import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const getBorderColor = (col) => {
    switch (col) {
      case 'blue': return 'border-l-blue-500';
      case 'yellow': return 'border-l-yellow-500';
      case 'purple': return 'border-l-purple-500';
      case 'green': return 'border-l-green-500';
      case 'red': return 'border-l-red-500';
      default: return 'border-l-indigo-500';
    }
  };

  const getIconColor = (col) => {
    switch (col) {
      case 'blue': return 'text-blue-400 bg-blue-500/10';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/10';
      case 'purple': return 'text-purple-400 bg-purple-500/10';
      case 'green': return 'text-green-400 bg-green-500/10';
      case 'red': return 'text-red-400 bg-red-500/10';
      default: return 'text-indigo-400 bg-indigo-500/10';
    }
  };

  return (
    <div className={`bg-slate-800 border border-slate-700 border-l-4 ${getBorderColor(color)} rounded-lg p-5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${getIconColor(color)}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
