// src/index.js
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from './walletConfig';

const isIgnorableWalletConnectError = message => {
  if (!message) return false;
  return (
    message.includes('WalletConnect Cloud projectId') ||
    message.includes('Socket stalled when trying to connect to wss://relay.walletconnect.org')
  );
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', event => {
    if (event?.message && isIgnorableWalletConnectError(event.message)) {
      event.preventDefault();
      // eslint-disable-next-line no-console
      console.warn('[walletConfig] Ignoring known WalletConnect warning:', event.message);
    }
  });

  window.addEventListener('unhandledrejection', event => {
    const reasonMessage =
      (event?.reason && typeof event.reason === 'object' && 'message' in event.reason && event.reason.message) ||
      (typeof event?.reason === 'string' ? event.reason : null);

    if (reasonMessage && isIgnorableWalletConnectError(reasonMessage)) {
      event.preventDefault();
      // eslint-disable-next-line no-console
      console.warn('[walletConfig] Ignoring known WalletConnect warning:', reasonMessage);
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
