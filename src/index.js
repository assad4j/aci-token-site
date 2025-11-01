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

class AppBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(error) {
    return { err: error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[app] boundary captured error', error, info);
  }

  render() {
    const { err } = this.state;
    const { children } = this.props;
    if (err) {
      return (
        <div style={{ color: '#fff', padding: 24, background: '#0b1220', minHeight: '100vh' }}>
          Une erreur est survenue. Actualise la page ou réessaie plus tard.
        </div>
      );
    }
    return children;
  }
}

root.render(
  <React.StrictMode>
    <AppBoundary>
      <Suspense fallback={<div style={{ color: '#fff', padding: 24 }}>Chargement…</div>}>
        <WalletProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletProvider>
      </Suspense>
    </AppBoundary>
  </React.StrictMode>,
);
