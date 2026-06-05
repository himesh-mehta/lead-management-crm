import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './layouts/AppLayout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Stats from './pages/Stats';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

// ─── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#ff7a59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#ff7a59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

// ─── App Layout Wrapper ────────────────────────────────────────────────────────
const AppLayoutOutlet: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

// ─── App Component ─────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const location = useLocation();

  // Force light mode
  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.removeItem('theme');
      let meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'color-scheme');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'only light');
    } catch (e) {}
  }, []);

  // Dynamic page title
  useEffect(() => {
    const path = location.pathname;
    let title = 'Dashboard';
    if (path === '/') title = 'Dashboard';
    else if (path === '/login') title = 'Sign In';
    else if (path === '/register') title = 'Register';
    else if (path === '/leads') title = 'Leads Directory';
    else if (path.startsWith('/leads/')) title = 'Lead Details';
    else if (path.startsWith('/stats') || path.startsWith('/statistics')) title = 'Pipeline Analytics';
    else if (path.startsWith('/customers')) title = 'Customers';
    else if (path.startsWith('/settings')) title = 'System Settings';
    else title = 'LeadBridge';
    document.title = `${title} | LeadBridge`;
  }, [location]);

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
      iconTheme: { primary: '#10b981', secondary: '#ffffff' },
      style: { borderLeft: '4px solid #10b981' },
    },
    error: {
      iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
      style: { borderLeft: '4px solid #ef4444' },
    },
  };

  return (
    <>
      <Routes>
        {/* Public routes — redirect to / if already logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected routes — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayoutOutlet />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/statistics" element={<Stats />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" toastOptions={toastOptions} />
    </>
  );
};

export default App;
