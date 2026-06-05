import React from 'react';

const badgeConfig = {
  new:       { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  contacted: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  qualified: { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  converted: { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  lost:      { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

const StatusBadge = ({ status }) => {
  const key = status ? status.toLowerCase() : '';
  const cfg = badgeConfig[key] || { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
