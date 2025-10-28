// src/index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
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

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Chargement…</div>}>
      <WalletProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WalletProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);
