// src/components/CoachIASection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CoachIASection({ variant = 'page' }) {
  const isHome = variant === 'home';
  const { t } = useTranslation();

  const bullets = t('coachIASection.bullets', { returnObjects: true }) || [];
  const ctas = t('coachIASection.cta', { returnObjects: true }) || {};

  return (
    <section className={`relative overflow-hidden ${isHome ? 'py-16' : 'py-20'}`}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-600/10 via-black/70 to-black/90" />
      <div className="relative z-10 mx-auto max-w-4xl text-white">
        <div className="text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">
            {t('coachIASection.badge')}
          </p>
          <h2 className={`${isHome ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-bold text-balance`}>
            {t(`coachIASection.${isHome ? 'titleHome' : 'titlePage'}`)}
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            {t('coachIASection.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {bullets.map(item => (
            <div
              key={item}
              className="rounded-3xl border border-emerald-500/30 bg-black/60 p-6 shadow-xl shadow-emerald-500/10 backdrop-blur"
            >
              <p className="text-sm leading-relaxed text-white/80">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/contact"
            className="rounded-full bg-[#10b981] px-8 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
          >
            {ctas.contact}
          </Link>
          <Link
            to="/token"
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-[#10b981] hover:text-[#10b981]"
          >
            {ctas.token}
          </Link>
        </div>
      </div>
    </section>
  );
}
