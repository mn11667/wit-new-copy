import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

// Light parallax + glare tracking for glass layers
(() => {
  const root = document.documentElement;
  let raf: number | null = null;

  const handleMove = (event: MouseEvent) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      root.style.setProperty('--glare-x', `${(x * 100).toFixed(2)}%`);
      root.style.setProperty('--glare-y', `${(y * 100).toFixed(2)}%`);
      root.style.setProperty('--bg-shift-x', `${((x - 0.5) * 8).toFixed(2)}%`);
      root.style.setProperty('--bg-shift-y', `${((y - 0.5) * 8).toFixed(2)}%`);
      raf = null;
    });
  };

  window.addEventListener('mousemove', handleMove, { passive: true });
})();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
