import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './styles/index.css';
import App from './App';
import { ToastProvider } from './components/ui/Toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
        {!isLocal && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
);
