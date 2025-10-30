import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiTrendingUp,
  FiUsers,
  FiCpu,
  FiVolume2,
  FiShield,
  FiGlobe,
  FiExternalLink,
} from 'react-icons/fi';

const SectionGrid = React.memo(function SectionGrid({ title, items, accent }) {
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
});
SectionGrid.displayName = 'SectionGrid';

export default function TokenPage() {
  const { t, i18n } = useTranslation();

  const tokenContent = useMemo(() => {
    const base = t('tokenPage', { returnObjects: true }) ?? {};
    const economics = base.sections?.economics ?? {};
    const governance = base.sections?.governance ?? {};
    const tokenomicsBreakdown = base.tokenomicsBreakdown ?? {};
    const cta = base.cta ?? {};
    return {
      title: base.title ?? 'Meta Coach Token (ACI)',
      intro: base.intro ?? '',
      sections: {
        economics: {
          title: economics.title ?? '',
          items: Array.isArray(economics.items) ? economics.items : [],
        },
        governance: {
          title: governance.title ?? '',
          items: Array.isArray(governance.items) ? governance.items : [],
        },
      },
      cta: {
        title: cta.title ?? '',
        subtitle: cta.subtitle ?? '',
        buttons: {
          whitepaper: cta.buttons?.whitepaper ?? t('tokenPage.cta.buttons.whitepaper', { defaultValue: 'Whitepaper' }),
          buy: cta.buttons?.buy ?? t('tokenPage.cta.buttons.buy', { defaultValue: 'Buy' }),
          contact: cta.buttons?.contact ?? t('tokenPage.cta.buttons.contact', { defaultValue: 'Contact' }),
        },
      },
      tokenomicsBreakdown: {
        tagline: tokenomicsBreakdown.tagline ?? '',
        title: tokenomicsBreakdown.title ?? '',
        subtitle: tokenomicsBreakdown.subtitle ?? '',
        totalSupplyLabel: tokenomicsBreakdown.totalSupplyLabel ?? '',
        totalSupplyValue: tokenomicsBreakdown.totalSupplyValue ?? '',
        headers: tokenomicsBreakdown.headers ?? {
          segment: t('tokenPage.tokenomicsBreakdown.headers.segment'),
          percentage: t('tokenPage.tokenomicsBreakdown.headers.percentage'),
          amount: t('tokenPage.tokenomicsBreakdown.headers.amount'),
        },
        rows: Array.isArray(tokenomicsBreakdown.rows) ? tokenomicsBreakdown.rows : [],
      },
    };
  }, [t, i18n.language]);

  const economicsSections = tokenContent.sections.economics.items;
  const economicsTitle = tokenContent.sections.economics.title;
  const governanceSections = tokenContent.sections.governance.items;
  const governanceTitle = tokenContent.sections.governance.title;
  const tokenomicsRows = tokenContent.tokenomicsBreakdown.rows;
  const {
    tagline: tokenomicsTagline,
    title: tokenomicsBreakdownTitle,
    subtitle: tokenomicsBreakdownSubtitle,
    totalSupplyLabel: tokenomicsTotalLabel,
    totalSupplyValue: tokenomicsTotalValue,
    headers: tokenomicsHeaders,
  } = tokenContent.tokenomicsBreakdown;
  const tokenIconMap = {
    presale: FiTrendingUp,
    community: FiUsers,
    team: FiCpu,
    marketing: FiVolume2,
    reserve: FiShield,
    dao: FiGlobe,
  };

  return (
    <div className="py-20 text-white">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{tokenContent.title}</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
          {tokenContent.intro}
        </p>
      </header>

      {tokenomicsRows.length > 0 && (
        <section className="mt-16 rounded-3xl border border-white/15 bg-gradient-to-br from-black/80 via-[#0d1424] to-black/90 p-10 shadow-2xl shadow-emerald-500/10 backdrop-blur">
          {tokenomicsTagline ? (
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70 text-center">{tokenomicsTagline}</p>
          ) : null}
          <h2 className="mt-3 text-3xl font-semibold text-[#facc15] text-center">{tokenomicsBreakdownTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70 text-center">{tokenomicsBreakdownSubtitle}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/70">
              <span className="text-white/90">{tokenomicsTotalLabel}</span>{' '}
              <span className="font-semibold text-emerald-200">{tokenomicsTotalValue}</span>
            </span>
          </div>

          <div className="mt-10 space-y-4">
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/50 sm:grid sm:grid-cols-[1.6fr_repeat(2,1fr)]">
              <span>{tokenomicsHeaders.segment}</span>
              <span>{tokenomicsHeaders.percentage}</span>
              <span className="text-right">{tokenomicsHeaders.amount}</span>
            </div>

            {tokenomicsRows.map(row => {
              const Icon = tokenIconMap[row.icon] ?? FiTrendingUp;
              return (
                <div
                  key={row.id ?? row.label}
                  className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-lg shadow-black/30 transition hover:border-emerald-400/40 hover:shadow-emerald-500/10 sm:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-cyan-500/30 text-lg text-emerald-100">
                      <Icon />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <span className="text-base font-semibold text-white">{row.label}</span>
                    {row.description ? (
                      <span className="mt-1 text-sm text-white/60">{row.description}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end justify-center text-right">
                    <span className="text-lg font-semibold text-[#facc15]">{row.percentage}</span>
                    <span className="text-xs uppercase tracking-wide text-white/60">{row.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-16 rounded-3xl border border-emerald-500/20 bg-black/60 p-8 text-center shadow-xl shadow-emerald-500/10">
        <h3 className="text-2xl font-semibold">{tokenContent.accessTitle}</h3>
        <p className="mt-4 text-sm leading-relaxed text-white/75">
          {tokenContent.accessDescription}
        </p>
      </section>

      <section className="mt-16 space-y-12">
        <SectionGrid title={economicsTitle} items={economicsSections} accent="cyan" />
        <SectionGrid title={governanceTitle} items={governanceSections} accent="violet" />
      </section>

      <section className="mt-16 rounded-3xl border border-white/15 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <h3 className="text-3xl font-semibold text-emerald-200">{tokenContent.cta.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{tokenContent.cta.subtitle}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            to="/whitepaper"
            className="rounded-full border border-emerald-400/70 px-6 py-2 font-semibold text-emerald-200 transition hover:border-emerald-200 hover:text-emerald-50"
          >
            {tokenContent.cta.buttons.whitepaper}
          </Link>
          <Link
            to="/buy-token"
            className="rounded-full bg-emerald-500 px-6 py-2 font-semibold text-black transition hover:bg-emerald-400"
          >
            {tokenContent.cta.buttons.buy}
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-white/30 px-6 py-2 font-semibold text-white transition hover:border-white/60"
          >
            {tokenContent.cta.buttons.contact}
          </Link>
        </div>
      </section>
    </div>
  );
}
