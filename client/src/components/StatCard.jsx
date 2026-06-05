import React from 'react';

const colorMap = {
  indigo: {
    topBorder: '#4F46E5',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  green: {
    topBorder: '#10B981',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
  },
  yellow: {
    topBorder: '#F59E0B',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
  },
  purple: {
    topBorder: '#8B5CF6',
    iconBg: '#EDE9FE',
    iconColor: '#8B5CF6',
  },
  blue: {
    topBorder: '#3B82F6',
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  red: {
    topBorder: '#EF4444',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
  },
};

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        borderTop: `3px solid ${theme.topBorder}`,
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: label + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {title}
        </p>

        {Icon && (
          <div
            style={{
              width: 36,
              height: 36,
              background: theme.iconBg,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={18} color={theme.iconColor} />
          </div>
        )}
      </div>

      {/* Number */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#0F172A',
          margin: '12px 0 4px',
          lineHeight: 1,
        }}
      >
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
