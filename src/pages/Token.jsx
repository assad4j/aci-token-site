import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SectionGrid({ title, items, accent }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const accentClass =
    {
      emerald: 'from-emerald-500/10 to-emerald-500/0 border-emerald-400/40',
      cyan: 'from-cyan-500/10 to-cyan-500/0 border-cyan-400/40',
      violet: 'from-violet-500/10 to-violet-500/0 border-violet-400/40',
    }[accent] || 'from-emerald-500/10 to-emerald-500/0 border-emerald-400/40';

  return (
    <div>
      <h3 className="text-2xl font-semibold text-white/90">{title}</h3>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {items.map(item => (
          <article
            key={item.title}
            className={`rounded-3xl border bg-gradient-to-b ${accentClass} p-6 shadow-xl shadow-black/30 backdrop-blur`}
          >
            <h4 className="text-lg font-semibold text-white/90">{item.title}</h4>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function TokenPage() {
  const { t } = useTranslation();

  const utilities = t('tokenPage.utilities', { returnObjects: true }) ?? [];
  const tokenomics = t('tokenPage.tokenomics', { returnObjects: true }) ?? [];
  const deepDive = t('tokenPage.deepDive', { returnObjects: true }) ?? [];

  const utilitySections = t('tokenPage.sections.utility.items', { returnObjects: true }) ?? [];
  const utilityTitle = t('tokenPage.sections.utility.title');

  const economicsSections = t('tokenPage.sections.economics.items', { returnObjects: true }) ?? [];
  const economicsTitle = t('tokenPage.sections.economics.title');

  const governanceSections = t('tokenPage.sections.governance.items', { returnObjects: true }) ?? [];
  const governanceTitle = t('tokenPage.sections.governance.title');

  const deepDiveTitle = t('tokenPage.deepDiveTitle');
  const ctaTitle = t('tokenPage.cta.title');
  const ctaSubtitle = t('tokenPage.cta.subtitle');
  const ctaButtons = t('tokenPage.cta.buttons', { returnObjects: true }) ?? {};

  return (
    <div className="py-20 text-white">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t('tokenPage.title')}</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
          {t('tokenPage.intro')}
        </p>
      </header>

      {deepDive.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-white/10 bg-black/55 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur">
          <h2 className="text-3xl font-semibold text-emerald-300 text-center">{deepDiveTitle}</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/75">
            {deepDive.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-500/25 bg-black/70 p-8 shadow-xl shadow-emerald-500/15 backdrop-blur">
          <h2 className="text-2xl font-semibold text-[#10b981]">{t('tokenPage.utilitiesTitle')}</h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/80">
            {utilities.map(item => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#10b981]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-emerald-200/70">
            {t('tokenPage.progressTag')}
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <h2 className="text-2xl font-semibold text-balance">{t('tokenPage.tokenomicsTitle')}</h2>
          <ul className="mt-6 space-y-3">
            {tokenomics.map(item => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm"
              >
                <span className="text-white/75">{item.label}</span>
                <span className="font-semibold text-[#10b981]">{item.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-white/65">
            {t('tokenPage.tokenomicsNote')}
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-emerald-500/20 bg-black/60 p-8 text-center shadow-xl shadow-emerald-500/10">
        <h3 className="text-2xl font-semibold">{t('tokenPage.accessTitle')}</h3>
        <p className="mt-4 text-sm leading-relaxed text-white/75">
          {t('tokenPage.accessDescription')}
        </p>
      </section>

      <section className="mt-16 space-y-12">
        <SectionGrid title={utilityTitle} items={utilitySections} accent="emerald" />
        <SectionGrid title={economicsTitle} items={economicsSections} accent="cyan" />
        <SectionGrid title={governanceTitle} items={governanceSections} accent="violet" />
      </section>

      <section className="mt-16 rounded-3xl border border-white/15 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <h3 className="text-3xl font-semibold text-emerald-200">{ctaTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{ctaSubtitle}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            to="/whitepaper"
            className="rounded-full border border-emerald-400/70 px-6 py-2 font-semibold text-emerald-200 transition hover:border-emerald-200 hover:text-emerald-50"
          >
            {ctaButtons.whitepaper}
          </Link>
          <Link
            to="/buy-token"
            className="rounded-full bg-emerald-500 px-6 py-2 font-semibold text-black transition hover:bg-emerald-400"
          >
            {ctaButtons.buy}
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-white/30 px-6 py-2 font-semibold text-white transition hover:border-white/60"
          >
            {ctaButtons.contact}
          </Link>
        </div>
      </section>
    </div>
  );
}
