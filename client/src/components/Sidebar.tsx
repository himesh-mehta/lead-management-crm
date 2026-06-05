import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
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

const getHeaderStyles = (title: string) => {
  switch (title.toLowerCase()) {
    case 'workspace':
      return {
        border: 'border-indigo-500/20 dark:border-indigo-500/10',
        pill: 'bg-indigo-500 dark:bg-indigo-400',
        text: 'text-indigo-600 dark:text-indigo-400'
      };
    case 'management':
      return {
        border: 'border-violet-500/20 dark:border-violet-500/10',
        pill: 'bg-violet-500 dark:bg-violet-400',
        text: 'text-violet-600 dark:text-violet-400'
      };
    default:
      return {
        border: 'border-slate-200 dark:border-slate-800',
        pill: 'bg-slate-500 dark:bg-slate-400',
        text: 'text-slate-500 dark:text-slate-400'
      };
  }
};

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
        style={{ width: isOpen ? 260 : 56 }}
        className={`fixed top-12 bottom-0 left-0 z-50 md:z-30 flex flex-col glass-sidebar transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <nav className={`flex-1 py-5 px-2.5 space-y-6 ${isOpen ? 'overflow-y-auto' : 'overflow-visible'}`}>
          {sections.map((sec, idx) => {
            const styles = getHeaderStyles(sec.title);
            return (
              <div key={sec.title} className="space-y-1">
                {isOpen ? (
                  <div className={`border-b-2 ${styles.border} pb-1.5 mb-2.5 mx-1.5 flex items-center gap-2`}>
                    <span className={`w-1 h-3 rounded-full ${styles.pill} shadow-xs`} />
                    <h4 className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                      {sec.title}
                    </h4>
                  </div>
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
                      `flex items-center ${isOpen ? 'justify-between px-3.5' : 'justify-center px-1'} py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border-l-2 group relative ${
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
                    
                    {/* Custom Popup Tooltip when Collapsed */}
                    {!isOpen && (
                      <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-slate-850 z-50 pointer-events-none">
                        {name}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
        </nav>

        {/* Bottom Profile & Collapse Toggle */}
        <div className="border-t border-indigo-500/20 dark:border-indigo-950/50 bg-gray-50/30 dark:bg-slate-900/10 flex flex-col gap-2 p-3 flex-shrink-0">
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
              <div className="relative group flex justify-center items-center">
                <button 
                  onClick={toggleSidebar}
                  className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="absolute bottom-9 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-slate-850 z-50 pointer-events-none">
                  Collapse Sidebar
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              {/* Profile Avatar with Custom Tooltip */}
              <div className="relative group w-8 h-8 flex justify-center items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center border border-indigo-200/30 text-xs cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-950 transition-colors">
                  HM
                </div>
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-slate-850 z-50 pointer-events-none">
                  Himesh Mehta (Super Admin)
                </div>
              </div>
              
              {/* Desktop expand toggle with Tooltip */}
              <div className="relative group flex justify-center items-center">
                <button 
                  onClick={toggleSidebar}
                  className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-slate-100 dark:hover:bg-slate-805 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-slate-850 z-50 pointer-events-none">
                  Expand Sidebar
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
