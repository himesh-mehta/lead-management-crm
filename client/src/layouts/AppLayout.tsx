import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  onAddLeadClick?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, onAddLeadClick }) => {
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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-955 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main workspace with smooth layout transitions */}
      <div 
        className={`flex-1 flex flex-col h-screen overflow-hidden min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-[260px]' : 'md:ml-0'
        }`}
      >
        {/* Sticky navbar */}
        <Navbar 
          title={title} 
          toggleSidebar={toggleSidebar} 
          onAddLeadClick={onAddLeadClick} 
        />

        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-955">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
