// src/index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from './walletConfig';

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
