// src/index.js
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from './walletConfig';

if (typeof window !== 'undefined') {
  window.addEventListener('error', event => {
    if (event?.message && event.message.includes('WalletConnect Cloud projectId')) {
      event.preventDefault();
      // eslint-disable-next-line no-console
      console.warn('[walletConfig] Ignoring WalletConnect projectId error (fallback mode).');
    }
  });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element was not found. Ensure index.html contains a div#root.');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Chargement…</div>}>
      <WalletProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WalletProvider>
    </Suspense>
  </React.StrictMode>,
);
