import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import AddLead from './pages/AddLead';
import EditLead from './pages/EditLead';
import Stats from './pages/Stats';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => setSidebarOpen(v => !v);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Load persisted theme at application startup
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    let t = 'Dashboard';
    if (path === '/') t = 'Dashboard';
    else if (path.startsWith('/leads/add') || path.startsWith('/add-lead')) t = 'Add New Lead';
    else if (path.startsWith('/leads/edit')) t = 'Edit Lead';
    else if (path.startsWith('/leads')) t = 'Leads Directory';
    else if (path.startsWith('/stats') || path.startsWith('/statistics')) t = 'Pipeline Analytics';
    else if (path.startsWith('/customers')) t = 'Converted Customers';
    else if (path.startsWith('/settings')) t = 'System Settings';
    else t = 'LeadFlow CRM';
    setPageTitle(t);
    document.title = `${t} | LeadFlow CRM`;
  }, [location]);

  const isNotFound =
    !['/', '/leads', '/leads/add', '/add-lead', '/statistics', '/stats', '/customers', '/settings'].includes(
      location.pathname
    ) && !location.pathname.startsWith('/leads/edit/');

  const toastOptions = {
    duration: 3500,
    style: {
      background: 'rgba(17, 24, 39, 0.95)',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '12px',
      fontSize: '13px',
      backdropFilter: 'blur(8px)',
    },
  };

  if (isNotFound) {
    return (
      <>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" toastOptions={toastOptions} />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* ── Fixed sidebar ── */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ── Main area pushed right of sidebar on md+ ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 md:ml-64">
        {/* Sticky navbar */}
        <Navbar 
          title={pageTitle} 
          toggleSidebar={toggleSidebar} 
          onAddLeadClick={() => navigate('/leads?add=true')} 
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/leads"          element={<Leads />} />
            <Route path="/leads/add"      element={<AddLead />} />
            <Route path="/add-lead"       element={<AddLead />} />
            <Route path="/leads/edit/:id" element={<EditLead />} />
            <Route path="/statistics"     element={<Stats />} />
            <Route path="/stats"          element={<Stats />} />
            <Route path="/customers"      element={<Customers />} />
            <Route path="/settings"       element={<Settings />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <Toaster position="top-right" toastOptions={toastOptions} />
    </div>
  );
}

export default App;
