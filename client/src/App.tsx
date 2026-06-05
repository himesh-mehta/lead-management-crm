import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './layouts/AppLayout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Stats from './pages/Stats';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Force light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  // Update document title dynamically based on location
  useEffect(() => {
    const path = location.pathname;
    let title = 'Dashboard';

    if (path === '/') title = 'Dashboard';
    else if (path.startsWith('/leads/')) {
      if (path === '/leads') title = 'Leads Directory';
      else title = 'Lead Details';
    } 
    else if (path.startsWith('/stats') || path.startsWith('/statistics')) title = 'Pipeline Analytics';
    else if (path.startsWith('/customers')) title = 'Converted Customers';
    else if (path.startsWith('/settings')) title = 'System Settings';
    else title = 'LeadBridge CRM';

    setPageTitle(title);
    document.title = `${title} | LeadBridge CRM`;
  }, [location]);

  const isNotFound = ![
    '/', '/leads', '/statistics', '/stats', '/customers', '/settings'
  ].includes(location.pathname) && !location.pathname.startsWith('/leads/');

  const toastOptions = {
    duration: 3500,
    style: {
      background: 'rgba(15, 23, 42, 0.95)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      fontSize: '13px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
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
    <>
      <AppLayout title={pageTitle}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/statistics" element={<Stats />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
      <Toaster position="top-right" toastOptions={toastOptions} />
    </>
  );
};

export default App;
