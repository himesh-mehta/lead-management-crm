import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

// Initialize React Query client for caching and request states
const queryClient = new QueryClient({
  defaultQueries: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
} as any);

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
