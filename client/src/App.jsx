import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page imports
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import AddLead from './pages/AddLead';
import EditLead from './pages/EditLead';
import Stats from './pages/Stats';
import NotFound from './pages/NotFound';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Set navbar and browser document title based on path
  useEffect(() => {
    const path = location.pathname;
    let titleStr = 'Dashboard';
    
    if (path === '/') {
      titleStr = 'Dashboard';
    } else if (path.startsWith('/leads/add') || path.startsWith('/add-lead')) {
      titleStr = 'Add New Lead';
    } else if (path.startsWith('/leads/edit')) {
      titleStr = 'Edit Lead';
    } else if (path.startsWith('/leads')) {
      titleStr = 'Leads Directory';
    } else if (path.startsWith('/stats') || path.startsWith('/statistics')) {
      titleStr = 'Pipeline Analytics';
    } else {
      titleStr = 'LeadFlow CRM';
    }

    setPageTitle(titleStr);
    document.title = `${titleStr} | LeadFlow CRM`;
  }, [location]);

  // Don't show sidebar/navbar on 404 pages for clean visual focus
  const isNotFound = ![
    '/',
    '/leads',
    '/leads/add',
    '/add-lead',
    '/statistics',
    '/stats'
  ].includes(location.pathname) && !location.pathname.startsWith('/leads/edit/');

  if (isNotFound) {
    return (
      <>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }} 
        />
      </>
    );
  }

  return (
    <div className="flex bg-slate-900 min-h-screen text-slate-100 font-sans overflow-x-hidden">
      {/* Mobile-slideable Sidebar drawer */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title={pageTitle} 
          toggleSidebar={toggleSidebar}
        />

        {/* Dynamic Route Container */}
        <main className="flex-grow">
          {/* Smooth opacity page fade transition wrapper */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/add" element={<AddLead />} />
              <Route path="/add-lead" element={<AddLead />} />
              <Route path="/leads/edit/:id" element={<EditLead />} />
              <Route path="/statistics" element={<Stats />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="bg-slate-800/40 border-t border-slate-700 py-4 px-6 text-center text-xs text-slate-500 font-semibold tracking-wide">
          LeadFlow CRM © 2026. All rights reserved.
        </footer>
      </div>

      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }} 
      />
    </div>
  );
}

export default App;
