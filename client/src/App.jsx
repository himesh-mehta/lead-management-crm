import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import AddLead from './pages/AddLead';
import EditLead from './pages/EditLead';
import Stats from './pages/Stats';
import NotFound from './pages/NotFound';

const SIDEBAR_W = 256; // px — matches w-64

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => setSidebarOpen(v => !v);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    let t = 'Dashboard';
    if (path === '/') t = 'Dashboard';
    else if (path.startsWith('/leads/add') || path.startsWith('/add-lead')) t = 'Add New Lead';
    else if (path.startsWith('/leads/edit')) t = 'Edit Lead';
    else if (path.startsWith('/leads')) t = 'Leads Directory';
    else if (path.startsWith('/stats') || path.startsWith('/statistics')) t = 'Pipeline Analytics';
    else t = 'LeadFlow CRM';
    setPageTitle(t);
    document.title = `${t} | LeadFlow CRM`;
  }, [location]);

  const isNotFound =
    !['/', '/leads', '/leads/add', '/add-lead', '/statistics', '/stats'].includes(
      location.pathname
    ) && !location.pathname.startsWith('/leads/edit/');

  const toastOptions = {
    duration: 3500,
    style: {
      background: '#ffffff',
      color: '#0F172A',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderRadius: 10,
      fontSize: 14,
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
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#F8FAFC',
      }}
    >
      {/* ── Fixed sidebar ── */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ── Main area pushed right of sidebar on md+ ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          minWidth: 0,
        }}
        className="md:ml-64"
      >
        {/* Sticky navbar */}
        <Navbar title={pageTitle} toggleSidebar={toggleSidebar} />

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/leads"          element={<Leads />} />
            <Route path="/leads/add"      element={<AddLead />} />
            <Route path="/add-lead"       element={<AddLead />} />
            <Route path="/leads/edit/:id" element={<EditLead />} />
            <Route path="/statistics"     element={<Stats />} />
            <Route path="/stats"          element={<Stats />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <Toaster position="top-right" toastOptions={toastOptions} />
    </div>
  );
}

export default App;
