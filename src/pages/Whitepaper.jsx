import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileDownload, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const TIMELINE_ACCENT_FALLBACK = 'text-white/80';

export default function WhitepaperPage() {
  const { t } = useTranslation();

  const hero = t('whitepaperPage.hero', { returnObjects: true }) ?? {};
  const heroTitle = hero.title ?? {};
  const heroActions = hero.actions ?? {};
  const heroBadge = hero.badge ?? '';
  const heroDescription = hero.description ?? '';
  const downloadLabel = heroActions.download ?? '';
  const contactLabel = heroActions.contact ?? '';

  const timelineData = t('whitepaperPage.timeline', { returnObjects: true });
  const timeline = Array.isArray(timelineData) ? timelineData : [];

  const highlightsData = t('whitepaperPage.highlights', { returnObjects: true });
  const highlights = Array.isArray(highlightsData) ? highlightsData : [];

  const newsletter = t('whitepaperPage.newsletter', { returnObjects: true }) ?? {};
  const newsletterTitle = newsletter.title ?? '';
  const newsletterSubtitle = newsletter.subtitle ?? '';
  const newsletterPlaceholder = newsletter.inputPlaceholder ?? '';
  const newsletterSubmit = newsletter.submit ?? '';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-[#0a101d] to-[#020409] px-6 py-20 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-12 shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35)] backdrop-blur">
          <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 text-center">
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-emerald-200">
              {heroBadge}
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {heroTitle.line1}
              {heroTitle.line2 ? (
                <>
                  <br className="hidden sm:block" />
                  {heroTitle.line2}
                </>
              ) : null}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/70">
              {heroDescription}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                <a
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#10b981] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
                  href="/WHITEPAPER.pdf"
                  download
                >
                  <FaFileDownload className="text-base" />
                  {downloadLabel}
                </a>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:text-emerald-200"
              >
                {contactLabel}
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <div className="mt-6 grid w-full gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs uppercase tracking-[0.35em] text-white/60 sm:grid-cols-3">
              {timeline.map(item => (
                <div key={item.label} className="flex flex-col gap-1 rounded-xl bg-white/5 px-4 py-3 text-left">
                  <span>{item.label}</span>
                  <span className={`text-sm font-semibold normal-case tracking-normal ${item.accentClass ?? TIMELINE_ACCENT_FALLBACK}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map(section => (
            <div
              key={section.title ?? section.id ?? JSON.stringify(section)}
              className="rounded-3xl border border-emerald-400/20 bg-white/5 p-6 shadow-[0_20px_80px_-35px_rgba(16,185,129,0.5)]"
            >
              <h2 className="text-xl font-semibold text-emerald-200">{section.title ?? ''}</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {(Array.isArray(section.points) ? section.points : []).map(point => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Secondary CTA */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 px-8 py-10 text-center text-white/80">
          <h2 className="text-2xl font-semibold text-white">{newsletterTitle}</h2>
          <p className="mt-3 text-sm text-white/60">{newsletterSubtitle}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={newsletterPlaceholder}
              className="w-full max-w-sm rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981]/40"
            />
            <button
              type="button"
              className="rounded-full bg-[#10b981] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
            >
              {newsletterSubmit}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
