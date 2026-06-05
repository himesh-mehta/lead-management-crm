import React, { useState } from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title, toggleSidebar }) => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      style={{
        height: 64,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Left: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleSidebar}
          className="md:hidden"
          style={{
            padding: 6,
            borderRadius: 8,
            border: 'none',
            background: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#0F172A',
            margin: 0,
          }}
        >
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Right: search + button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative' }} className="hidden sm:block">
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search leads..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: '#F8FAFC',
              border: `1px solid ${searchFocused ? '#4F46E5' : '#E2E8F0'}`,
              borderRadius: 8,
              padding: '8px 12px 8px 36px',
              fontSize: 14,
              color: '#0F172A',
              width: 240,
              outline: 'none',
              boxShadow: searchFocused
                ? '0 0 0 3px rgba(79,70,229,0.1)'
                : 'none',
              transition: 'all 0.15s ease',
            }}
          />
        </div>

        {/* Add Lead button */}
        <button
          onClick={() => navigate('/add-lead')}
          style={{
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '9px 16px',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(79,70,229,0.3)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
          onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
        >
          <Plus size={16} />
          <span>Add Lead</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
