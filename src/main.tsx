import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once on failure, then show error
      retry: 1,
      // Re-fetch when window regains focus so data stays fresh
      refetchOnWindowFocus: true,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#18181b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#18181b' },
            duration: 5000,
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
