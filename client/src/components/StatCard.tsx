import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  growth?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: 'indigo' | 'green' | 'orange' | 'red' | 'blue';
}

const colorVariants = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100/50 dark:border-indigo-900/30',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100/50 dark:border-emerald-900/30',
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100/50 dark:border-amber-900/30',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-100/50 dark:border-red-900/30',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100/50 dark:border-blue-900/30',
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, growth, trend = 'neutral', icon: Icon, color = 'indigo' }) => {
  const variant = colorVariants[color] || colorVariants.indigo;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 shadow-soft hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 dark:hover:border-slate-700 flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-300">
      {/* Upper Section */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wide">
          {title}
        </span>
        
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${variant.bg} ${variant.icon} ${variant.border}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Value & Growth indicator */}
      <div className="flex items-end justify-between mt-3">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
          {value}
        </span>

        {/* Growth badge */}
        {growth && (
          <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            trend === 'up' 
              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' 
              : trend === 'down'
                ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
                : 'text-gray-650 bg-gray-50 dark:text-slate-450 dark:bg-slate-850'
          }`}>
            {trend === 'up' && <ArrowUpRight size={11} />}
            {trend === 'down' && <ArrowDownRight size={11} />}
            {trend === 'neutral' && <Minus size={11} />}
            <span>{growth}</span>
          </div>
        )}
      </div>

      {/* Bottom design accent stripe */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
        color === 'indigo' ? 'bg-indigo-500' :
        color === 'green' ? 'bg-emerald-500' :
        color === 'orange' ? 'bg-amber-500' :
        color === 'red' ? 'bg-red-500' : 'bg-blue-500'
      } opacity-60`} />
    </div>
  );
};

export default StatCard;
