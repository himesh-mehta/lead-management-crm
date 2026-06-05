import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, BarChart2, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard',  path: '/',           icon: LayoutDashboard, end: true  },
  { name: 'All Leads',  path: '/leads',       icon: Users,           end: false },
  { name: 'Add Lead',   path: '/add-lead',    icon: UserPlus,        end: false },
  { name: 'Statistics', path: '/statistics',  icon: BarChart2,       end: false },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          width: 256,
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 30,
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease',
        }}
        className={`md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* ── Logo ── */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo box */}
            <div
              style={{
                width: 32,
                height: 32,
                background: '#4F46E5',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
                L
              </span>
            </div>
            {/* Logo text */}
            <span style={{ fontSize: 16, lineHeight: 1 }}>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>LeadFlow</span>
              <span style={{ fontWeight: 700, color: '#4F46E5' }}> CRM</span>
            </span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="md:hidden"
            style={{
              color: '#94A3B8',
              padding: 4,
              borderRadius: 6,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {/* Section label */}
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              padding: '0 8px',
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            Main Menu
          </p>

          {navItems.map(({ name, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#4F46E5' : '#64748B',
                background: isActive ? '#EEF2FF' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
              className={({ isActive }) =>
                isActive ? '' : 'hover:bg-[#F8FAFC] hover:!text-[#0F172A]'
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? '#4F46E5' : 'currentColor'} />
                  <span>{name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom version tag ── */}
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
