// src/App.jsx
import React, { Suspense, lazy, useEffect } from 'react';
import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';

import NavigationBar   from './components/NavigationBar';
import PageWrapper     from './components/PageWrapper';
import Footer          from './components/Footer';
import AciPulsingBackground from './components/AciPulsingBackground';

const Home            = lazy(() => import('./pages/Home'));
const CoachIAPage     = lazy(() => import('./pages/CoachIA'));
const FormationsPage  = lazy(() => import('./pages/Formations'));
const TokenPage       = lazy(() => import('./pages/Token'));
const StakingScreen   = lazy(() => import('./pages/Staking'));
const RoadmapPage     = lazy(() => import('./pages/Roadmap'));
const WhitepaperPage  = lazy(() => import('./pages/Whitepaper'));
const FAQPage         = lazy(() => import('./pages/FAQ'));
const ContactPage     = lazy(() => import('./pages/Contact'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-emerald-200/80">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      <span>Chargement en cours...</span>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      [
        () => import('./pages/CoachIA'),
        () => import('./pages/Formations'),
        () => import('./pages/Token'),
        () => import('./pages/Staking'),
        () => import('./pages/Roadmap'),
        () => import('./pages/Whitepaper'),
        () => import('./pages/FAQ'),
        () => import('./pages/Contact'),
      ].forEach(loader => {
        loader().catch(error => {
          console.warn('[ACI] route prefetch failed', error);
        });
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AciPulsingBackground intensity={1} className="flex flex-col min-h-screen">
      {/* Navigation */}
      <NavigationBar />

      {/* Contenu */}
      <main className="flex-grow">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Home pleine page */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* Toutes les autres routes dans PageWrapper */}
            <Route
              path="/coach-ia"
              element={
                <PageWrapper>
                  <CoachIAPage />
                </PageWrapper>
              }
            />
            <Route
              path="/formations"
              element={
                <PageWrapper>
                  <FormationsPage />
                </PageWrapper>
              }
            />
            <Route
              path="/token"
              element={
                <PageWrapper>
                  <TokenPage />
                </PageWrapper>
              }
            />
            <Route
              path="/staking"
              element={
                <PageWrapper>
                  <StakingScreen />
                </PageWrapper>
              }
            />
            <Route
              path="/roadmap"
              element={
                <PageWrapper>
                  <RoadmapPage />
                </PageWrapper>
              }
            />
            <Route
              path="/whitepaper"
              element={
                <PageWrapper>
                  <WhitepaperPage />
                </PageWrapper>
              }
            />
            <Route
              path="/faq"
              element={
                <PageWrapper>
                  <FAQPage />
                </PageWrapper>
              }
            />
            <Route
              path="/contact"
              element={
                <PageWrapper>
                  <ContactPage />
                </PageWrapper>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </AciPulsingBackground>
  );
}
