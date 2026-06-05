import React, { useEffect } from 'react';
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

  // Force light mode and disable auto dark mode
  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.removeItem('theme');
      
      // Enforce light-only color scheme to override Chrome Auto Dark Mode
      let meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'color-scheme');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'only light');
    } catch (e) {}
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

    document.title = `${title} | LeadBridge CRM`;
  }, [location]);

  const isNotFound = ![
    '/', '/leads', '/statistics', '/stats', '/customers', '/settings'
  ].includes(location.pathname) && !location.pathname.startsWith('/leads/');

  const toastOptions = {
    duration: 3500,
    style: {
      background: '#ffffff',
      color: '#1e293b',
      border: '1px solid #f1f5f9',
      borderRadius: '16px',
      fontSize: '13px',
      fontWeight: '600',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
      padding: '12px 20px',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
      style: {
        borderLeft: '4px solid #10b981',
      }
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
      style: {
        borderLeft: '4px solid #ef4444',
      }
    }
  };

  if (isNotFound) {
    return (
      <>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="bottom-right" toastOptions={toastOptions} />
      </>
    );
  }

  return (
    <>
      <AppLayout>
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
      <Toaster position="bottom-right" toastOptions={toastOptions} />
    </>
  );
};

export default App;
