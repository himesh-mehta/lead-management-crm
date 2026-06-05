import React from 'react';

const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { box: 'w-6 h-6 text-sm rounded-md', text: 'text-base', gap: 'gap-1.5' },
    md: { box: 'w-8 h-8 text-base rounded-lg', text: 'text-lg', gap: 'gap-2' },
    lg: { box: 'w-10 h-10 text-lg rounded-xl', text: 'text-xl', gap: 'gap-2.5' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div
        className={`${s.box} bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm`}
      >
        <span className="font-bold text-white leading-none" style={{ fontSize: size === 'sm' ? '13px' : size === 'lg' ? '20px' : '16px' }}>
          L
        </span>
      </div>
      <span className={`font-bold ${s.text} leading-none`}>
        <span className="text-gray-900">LeadFlow</span>
        <span className="text-indigo-600"> CRM</span>
      </span>
    </div>
  );
};

export default Logo;
