import React from 'react';
import { useTranslation } from 'react-i18next';
import { LuWallet, LuBrainCircuit, LuPlayCircle, LuAward } from 'react-icons/lu';

const STEP_ICONS = [LuWallet, LuBrainCircuit, LuPlayCircle, LuAward];

export default function FormationsPage() {
  const { t } = useTranslation();

  const modulesData = t('formations.modules', { returnObjects: true });
  const modules = Array.isArray(modulesData) ? modulesData : [];

  const bulletsData = t('formations.iaSection.bullets', { returnObjects: true });
  const iaBullets = Array.isArray(bulletsData) ? bulletsData : [];

  const stepsData = t('formations.howItWorks.steps', { returnObjects: true });
  const steps = Array.isArray(stepsData) ? stepsData : [];

  const moduleTagline = t('formations.moduleTagline');

  return (
    <div className="py-20 text-white">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold sm:text-5xl">{t('formations.hero.title')}</h1>
        <p className="mx-auto max-w-2xl text-base text-white/70 leading-relaxed">
          {t('formations.hero.intro')}
        </p>
        <p className="text-sm text-white/80">{t('formations.hero.stakingLine')}</p>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">
          {t('formations.hero.tokenTag')}
        </p>
      </header>

      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        {modules.map(module => (
          <article
            key={module.title}
            className="rounded-3xl border border-emerald-500/25 bg-black/70 p-6 shadow-xl shadow-emerald-500/10 backdrop-blur"
          >
            <h2 className="text-xl font-semibold text-[#10b981] text-balance">{module.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">{module.description}</p>
            {moduleTagline && (
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-emerald-200/70">
                {moduleTagline}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-white shadow-xl shadow-emerald-500/20 backdrop-blur">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
            {t('formations.iaSection.badge')}
          </p>
          <h2 className="text-2xl font-semibold text-balance">
            {t('formations.iaSection.heading')}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            {t('formations.iaSection.paragraph1')}
          </p>
          <p className="text-sm text-white/75 leading-relaxed">
            {t('formations.iaSection.paragraph2')}
          </p>
          <ul className="grid gap-4 sm:grid-cols-3">
            {iaBullets.map(item => (
              <li
                key={item}
                className="rounded-2xl border border-emerald-400/30 bg-black/30 p-4 text-sm leading-relaxed text-white/80 shadow-inner shadow-black/20"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <h2 className="text-2xl font-semibold text-center text-balance">
          {t('formations.howItWorks.title')}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] || LuWallet;
            return (
              <article
                key={step.title}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/50 p-5 text-white/80"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <Icon className="h-6 w-6 text-emerald-300" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/75">{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="mt-16 rounded-3xl border border-white/15 bg-white/5 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
        <h2 className="text-2xl font-semibold text-balance">
          {t('formations.ecosystem.title')}
        </h2>
        <p className="mt-4 text-sm text-white/75 leading-relaxed">
          {t('formations.ecosystem.paragraph1')}
        </p>
        <p className="mt-4 text-sm text-white/75 leading-relaxed">
          {t('formations.ecosystem.paragraph2')}
        </p>
      </section>

      <div className="mt-12 text-center">
        <button className="px-6 py-3 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition">
          {t('formations.cta.button')}
        </button>
        <p className="mt-2 text-xs text-white/60">{t('formations.cta.note')}</p>
      </div>
    </div>
  );
}
