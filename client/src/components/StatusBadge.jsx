import React from 'react';

const badgeConfig = {
  new:       { dot: 'rgb(var(--info))', text: 'rgb(var(--info))', bg: 'rgba(var(--info), 0.1)', border: '1px solid rgba(var(--info), 0.15)' },
  contacted: { dot: 'rgb(var(--warning))', text: 'rgb(var(--warning))', bg: 'rgba(var(--warning), 0.1)', border: '1px solid rgba(var(--warning), 0.15)' },
  qualified: { dot: 'rgb(var(--purple))', text: 'rgb(var(--purple))', bg: 'rgba(var(--purple), 0.1)', border: '1px solid rgba(var(--purple), 0.15)' },
  converted: { dot: 'rgb(var(--success))', text: 'rgb(var(--success))', bg: 'rgba(var(--success), 0.1)', border: '1px solid rgba(var(--success), 0.15)' },
  lost:      { dot: 'rgb(var(--danger))', text: 'rgb(var(--danger))', bg: 'rgba(var(--danger), 0.1)', border: '1px solid rgba(var(--danger), 0.15)' },
};

const StatusBadge = ({ status }) => {
  const key = status ? status.toLowerCase() : '';
  const cfg = badgeConfig[key] || { dot: 'rgb(var(--text-secondary))', text: 'rgb(var(--text-primary))', bg: 'rgba(var(--text-secondary), 0.1)', border: '1px solid rgba(var(--text-secondary), 0.15)' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 9999,
        background: cfg.bg,
        color: cfg.text,
        border: cfg.border,
        fontSize: '11px',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          display: 'inline-block',
        }}
      />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
