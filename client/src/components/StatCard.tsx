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
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100/50 dark:border-indigo-900/30',
    sparkline: {
      stroke: '#6366F1',
      fill: 'rgba(99, 102, 241, 0.06)',
      path: 'M 0 30 Q 15 10, 30 20 T 60 5 T 90 15 T 120 2'
    }
  },
  green: {
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100/50 dark:border-emerald-900/30',
    sparkline: {
      stroke: '#10B981',
      fill: 'rgba(16, 185, 129, 0.06)',
      path: 'M 0 32 Q 15 22, 30 25 T 60 8 T 90 6 T 120 2'
    }
  },
  orange: {
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100/50 dark:border-amber-900/30',
    sparkline: {
      stroke: '#F59E0B',
      fill: 'rgba(245, 158, 11, 0.06)',
      path: 'M 0 25 Q 15 28, 30 15 T 60 18 T 90 4 T 120 1'
    }
  },
  red: {
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-100/50 dark:border-red-900/30',
    sparkline: {
      stroke: '#EF4444',
      fill: 'rgba(239, 68, 68, 0.06)',
      path: 'M 0 2 Q 15 8, 30 22 T 60 18 T 90 28 T 120 35'
    }
  },
  blue: {
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100/50 dark:border-blue-900/30',
    sparkline: {
      stroke: '#3B82F6',
      fill: 'rgba(59, 130, 246, 0.06)',
      path: 'M 0 28 Q 15 32, 30 18 T 60 14 T 90 8 T 120 6'
    }
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, growth, trend = 'neutral', icon: Icon, color = 'indigo' }) => {
  const variant = colorVariants[color] || colorVariants.indigo;
  const sparkline = variant.sparkline;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-soft hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/20 dark:hover:border-slate-700 flex flex-col justify-between h-[120px] relative overflow-hidden transition-all duration-300 group">
      {/* Upper Section */}
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase">
          {title}
        </span>
        
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors duration-300 ${variant.bg} ${variant.icon} ${variant.border} group-hover:scale-105`}>
            <Icon size={14} />
          </div>
        )}
      </div>

      {/* Value, Sparkline & Growth Section */}
      <div className="flex items-end justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {value}
          </span>
          
          {/* Growth badge */}
          {growth && (
            <div className={`inline-flex items-center gap-0.5 mt-1 text-[9px] font-bold transition-all duration-300 ${
              trend === 'up' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
            }`}>
              {trend === 'up' && <ArrowUpRight size={10} />}
              {trend === 'down' && <ArrowDownRight size={10} />}
              {trend === 'neutral' && <Minus size={10} />}
              <span>{growth}</span>
            </div>
          )}
        </div>

        {/* Stripe-style SVG Sparkline */}
        <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300 mr-1 mb-1">
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 120 40">
            <path d={`${sparkline.path} L 120 40 L 0 40 Z`} fill={sparkline.fill} stroke="none" />
            <path d={sparkline.path} fill="none" stroke={sparkline.stroke} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Bottom design accent stripe */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
        color === 'indigo' ? 'bg-indigo-500' :
        color === 'green' ? 'bg-emerald-500' :
        color === 'orange' ? 'bg-amber-500' :
        color === 'red' ? 'bg-red-500' : 'bg-blue-500'
      } opacity-20 group-hover:opacity-50 transition-opacity duration-300`} />
    </div>
  );
};

export default StatCard;
