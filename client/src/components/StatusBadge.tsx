import React from 'react';
import { LeadStatus } from '../types';

interface StatusBadgeProps {
  status: LeadStatus;
}

const badgeConfig: Record<LeadStatus, { dot: string; text: string; bg: string; border: string }> = {
  New:       { dot: 'rgb(var(--info))', text: 'rgb(var(--info))', bg: 'rgba(var(--info), 0.1)', border: '1px solid rgba(var(--info), 0.15)' },
  Contacted: { dot: 'rgb(var(--warning))', text: 'rgb(var(--warning))', bg: 'rgba(var(--warning), 0.1)', border: '1px solid rgba(var(--warning), 0.15)' },
  Qualified: { dot: 'rgb(var(--purple))', text: 'rgb(var(--purple))', bg: 'rgba(var(--purple), 0.1)', border: '1px solid rgba(var(--purple), 0.15)' },
  Converted: { dot: 'rgb(var(--success))', text: 'rgb(var(--success))', bg: 'rgba(var(--success), 0.1)', border: '1px solid rgba(var(--success), 0.15)' },
  Lost:      { dot: 'rgb(var(--danger))', text: 'rgb(var(--danger))', bg: 'rgba(var(--danger), 0.1)', border: '1px solid rgba(var(--danger), 0.15)' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const key = status || 'New';
  const cfg = badgeConfig[key] || { dot: 'rgb(var(--text-secondary))', text: 'rgb(var(--text-primary))', bg: 'rgba(var(--text-secondary), 0.1)', border: '1px solid rgba(var(--text-secondary), 0.15)' };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200"
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: cfg.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{
          background: cfg.dot,
        }}
      />
      {status || 'New'}
    </span>
  );
};

export default StatusBadge;
