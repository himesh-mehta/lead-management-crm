import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const sections = [
  {
    title: 'Workspace',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
      { name: 'Leads Directory', path: '/leads', icon: Users, end: false },
      { name: 'Converted Customers', path: '/customers', icon: ShieldCheck, end: false },
      { name: 'Pipeline Analytics', path: '/stats', icon: BarChart3, end: false },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'System Settings', path: '/settings', icon: Settings, end: false },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{ width: 260 }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col h-full glass-sidebar transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-6 border-b border-gray-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center justify-center text-white font-extrabold text-xs tracking-wide">
              LB
            </div>
            <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-sm uppercase">
              LeadBridge <span className="text-indigo-600 dark:text-indigo-400 font-medium">CRM</span>
            </span>
          </div>

          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3">
                {sec.title}
              </h4>

              <div className="space-y-1">
                {sec.items.map(({ name, path, icon: Icon, end }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={end}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-150 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{name}</span>
                    </div>
                    <ChevronRight 
                      size={12} 
                      className="opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" 
                    />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Profile Card */}
        <div className="p-4 border-t border-gray-200/60 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 p-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center border border-indigo-200/30 text-xs">
              HM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
                Himesh Mehta
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                Super Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
