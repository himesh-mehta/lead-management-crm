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
  ChevronLeft,
  ChevronsUpDown,
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{ width: isOpen ? 260 : 68 }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col h-full glass-sidebar transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header Branding / Workspace Selector */}
        <div className="h-16 px-3.5 border-b border-gray-200/60 dark:border-slate-805/60 flex items-center justify-between">
          {isOpen ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 text-left select-none cursor-pointer p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex-1 mr-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center justify-center text-white font-extrabold text-xs tracking-wide">
                  LB
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">
                    LeadBridge
                  </h3>
                  <p className="text-[9px] text-gray-400 font-bold truncate uppercase tracking-wider mt-0.5">
                    Workspace
                  </p>
                </div>
                <ChevronsUpDown size={13} className="text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center justify-center text-white font-extrabold text-xs tracking-wide cursor-pointer hover:scale-105 transition-all">
                LB
              </div>
            </div>
          )}

          {isOpen && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-205 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-5 px-2.5 space-y-6">
          {sections.map((sec, idx) => (
            <div key={sec.title} className="space-y-1">
              {isOpen ? (
                <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2.5">
                  {sec.title}
                </h4>
              ) : idx > 0 ? (
                <div className="border-t border-slate-100 dark:border-slate-800/80 my-4 mx-2" />
              ) : null}

              <div className="space-y-0.5">
                {sec.items.map(({ name, path, icon: Icon, end }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={end}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center ${isOpen ? 'justify-between px-3.5' : 'justify-center px-1'} py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border-l-2 group ${
                        isActive
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 border-indigo-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/20 dark:hover:bg-slate-800/20 border-transparent'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={15} className="flex-shrink-0" />
                      {isOpen && <span>{name}</span>}
                    </div>
                    {isOpen && (
                      <ChevronRight 
                        size={12} 
                        className="opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity text-slate-400" 
                      />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Profile & Collapse Toggle */}
        <div className="border-t border-gray-150 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/10 flex flex-col gap-2 p-3 flex-shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-3 p-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center border border-indigo-200/30 text-xs flex-shrink-0">
                HM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
                  Himesh Mehta
                </p>
                <p className="text-[9px] text-gray-400 font-semibold truncate uppercase mt-0.5">
                  Super Admin
                </p>
              </div>
              
              {/* Desktop toggle collapse */}
              <button 
                onClick={toggleSidebar}
                className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center border border-indigo-200/30 text-xs cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-950 transition-colors">
                HM
              </div>
              
              {/* Desktop expand toggle */}
              <button 
                onClick={toggleSidebar}
                className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-slate-100 dark:hover:bg-slate-805 transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
