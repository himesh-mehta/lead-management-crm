import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  onAddLeadClick?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, onAddLeadClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-expanded');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth >= 768;
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((v) => {
      const next = !v;
      localStorage.setItem('sidebar-expanded', String(next));
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-955 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sticky top navbar spanning full width */}
      <Navbar 
        onAddLeadClick={onAddLeadClick} 
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative bg-[#253342] dark:bg-slate-950">
        {/* Sidebar navigation starting below the header */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main workspace scrollable content */}
        <main 
          className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-955 transition-all duration-300 ease-in-out md:rounded-tl-[24px] ${
            sidebarOpen ? 'md:ml-[260px]' : 'md:ml-[56px]'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
