import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();
  const directContacts = t('contactPage.direct', { returnObjects: true }) ?? [];
  const topicField = t('contactPage.form.topic', { returnObjects: true }) ?? {};
  const topics = Array.isArray(topicField?.topics) ? topicField.topics : [];

  return (
    <div className="py-20 text-white">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t('contactPage.title')}</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
          {t('contactPage.intro')}
        </p>
      </header>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-500/25 bg-black/70 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
          <h2 className="text-2xl font-semibold text-[#10b981]">{t('contactPage.directTitle')}</h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-white/75">
            {directContacts.map(item => {
              const href = item.href ?? '';
              const isExternalLink = href && !href.startsWith('mailto:');

              return (
                <li key={item.label}>
                  <span className="block text-xs uppercase tracking-[0.2em] text-emerald-200/70">
                    {item.label}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      target={isExternalLink ? '_blank' : undefined}
                      rel={isExternalLink ? 'noopener noreferrer' : undefined}
                      className="text-white/80 underline decoration-emerald-500/40 underline-offset-4 transition hover:text-emerald-200"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-xs text-white/60">{t('contactPage.directDisclaimer')}</p>
        </div>

        <form className="space-y-5 rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <h2 className="text-2xl font-semibold text-balance">{t('contactPage.form.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-white/70">
              {t('contactPage.form.firstName.label')}
              <input
                type="text"
                name="firstName"
                placeholder={t('contactPage.form.firstName.placeholder')}
                className="mt-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </label>
            <label className="flex flex-col text-sm text-white/70">
              {t('contactPage.form.lastName.label')}
              <input
                type="text"
                name="lastName"
                placeholder={t('contactPage.form.lastName.placeholder')}
                className="mt-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </label>
          </div>
          <label className="flex flex-col text-sm text-white/70">
            {t('contactPage.form.email.label')}
            <input
              type="email"
              name="email"
              placeholder={t('contactPage.form.email.placeholder')}
              className="mt-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="flex flex-col text-sm text-white/70">
            {t('contactPage.form.topic.label')}
            <select
              name="topic"
              className="mt-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {topics.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-white/70">
            {t('contactPage.form.message.label')}
            <textarea
              name="message"
              rows={4}
              placeholder={t('contactPage.form.message.placeholder')}
              className="mt-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-[#10b981] px-8 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
          >
            {t('contactPage.form.submit')}
          </button>
          <p className="text-center text-xs text-white/50">
            {t('contactPage.form.privacy')}
          </p>
        </form>
      </section>
    </div>
  );
}
