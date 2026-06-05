import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, BarChart3, Bolt, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Add Lead', path: '/add-lead', icon: UserPlus },
    { name: 'Statistics', path: '/statistics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 p-5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-650 rounded-lg text-white shadow-lg shadow-indigo-650/20">
              <Bolt size={20} className="animate-pulse text-indigo-200" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-100">LeadFlow CRM</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 text-slate-400 hover:text-slate-200 md:hidden focus:outline-none focus:ring-2 focus:ring-slate-600 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-650/30'
                      : 'text-slate-405 hover:bg-slate-700 hover:text-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
