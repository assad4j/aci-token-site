import React from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../components/PageWrapper';
import { FaRobot, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import { GiPocketWatch } from 'react-icons/gi';
import { SiSpeedtest } from 'react-icons/si';
import { TbChartBubble } from 'react-icons/tb';

const advantageCards = [
  {
    icon: <FaRobot className="h-6 w-6 text-emerald-300" />,
    translateKey: 'botAdvantageAi',
  },
  {
    icon: <FaChartLine className="h-6 w-6 text-emerald-300" />,
    translateKey: 'botAdvantageSignals',
  },
  {
    icon: <GiPocketWatch className="h-6 w-6 text-emerald-300" />,
    translateKey: 'botAdvantage24',
  },
  {
    icon: <FaShieldAlt className="h-6 w-6 text-emerald-300" />,
    translateKey: 'botAdvantageSecurity',
  },
];

const flowSteps = ['botStepConnect', 'botStepConfigure', 'botStepMonitor'];

export default function TradingBotPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-8 lg:py-20">
        <header className="flex flex-col gap-6 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#10b981]/40 bg-black/50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200/90">
            <TbChartBubble className="h-4 w-4" />
            {t('botLabelHeadline')}
          </span>
          <div className="space-y-4 text-balance">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t('botTitle')}
            </h1>
            <p className="mx-auto max-w-3xl text-sm text-white/70 sm:text-base lg:text-lg">
              {t('botSubtitle')}
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-[#10b981]/25 bg-gradient-to-br from-[#10b981]/25 via-black/60 to-black/85 p-6 sm:p-8 shadow-2xl shadow-[#10b981]/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">
                  {t('botSectionOverview')}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-emerald-100">
                  {t('botOverviewTitle')}
                </h2>
              </div>
              <span className="rounded-full border border-[#10b981]/40 bg-black/40 px-4 py-1 text-xs text-emerald-200">
                {t('botLiveBadge')}
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/75">
              {t('botOverviewDescription')}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {advantageCards.map(({ icon, translateKey }) => (
                <article
                  key={translateKey}
                  className="group min-w-0 rounded-2xl border border-[#10b981]/30 bg-black/60 px-5 py-4 shadow-lg shadow-[#10b981]/15 transition hover:bg-emerald-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#10b981]/40 bg-black/60">
                      {icon}
                    </div>
                    <h3 className="text-sm font-semibold tracking-wide text-emerald-200 uppercase">
                      {t(`${translateKey}.title`)}
                    </h3>
                  </div>
                  <p className="mt-3 text-xs text-white/65 leading-relaxed">
                    {t(`${translateKey}.desc`)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-[#10b981]/25 bg-black/70 p-6 shadow-xl shadow-[#10b981]/15">
              <div className="flex items-center gap-3 text-emerald-200">
                <SiSpeedtest className="h-6 w-6" />
                <h3 className="text-lg font-semibold text-balance">
                  {t('botPerformanceHeading')}
                </h3>
              </div>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                {t('botPerformanceDesc')}
              </p>
              <ul className="mt-5 space-y-3 text-sm text-white/65">
                <li>
                  <span className="font-semibold text-emerald-300">
                    {t('botMetricWinrate')}
                  </span>
                  <span className="ml-2">{t('botMetricWinrateValue')}</span>
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">
                    {t('botMetricPairs')}
                  </span>
                  <span className="ml-2">{t('botMetricPairsValue')}</span>
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">
                    {t('botMetricLatency')}
                  </span>
                  <span className="ml-2">{t('botMetricLatencyValue')}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[#10b981]/25 bg-black/70 p-6 shadow-xl shadow-[#10b981]/15">
              <h3 className="text-lg font-semibold text-emerald-200 text-balance">
                {t('botCTAHeading')}
              </h3>
              <p className="mt-3 text-sm text-white/65 leading-relaxed">
                {t('botCTADesc')}
              </p>
              <a
                href="https://forms.gle/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#10b981] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
              >
                {t('botCTAButton')}
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#10b981]/25 bg-black/70 p-6 sm:p-8 shadow-2xl shadow-[#10b981]/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4 text-balance">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">
                {t('botFlowLabel')}
              </p>
              <h2 className="text-2xl font-semibold text-emerald-100 sm:text-3xl">
                {t('botFlowTitle')}
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('botFlowSubtitle')}
              </p>
              <ol className="mt-6 grid gap-5 sm:grid-cols-3">
                {flowSteps.map((stepKey, idx) => (
                  <li
                    key={stepKey}
                    className="min-w-0 rounded-2xl border border-[#10b981]/25 bg-black/50 px-5 py-4 text-left shadow-lg shadow-[#10b981]/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-semibold text-emerald-200">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {t(`${stepKey}.title`)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white/60 leading-relaxed">
                      {t(`${stepKey}.desc`)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex h-full w-full max-w-sm flex-col gap-4 rounded-3xl border border-[#10b981]/20 bg-gradient-to-br from-black/80 to-emerald-500/15 px-5 py-6 shadow-xl shadow-[#10b981]/10">
              <h3 className="text-lg font-semibold text-emerald-200">
                {t('botChecklistTitle')}
              </h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li>• {t('botChecklistWallet')}</li>
                <li>• {t('botChecklistBalance')}</li>
                <li>• {t('botChecklistPlan')}</li>
                <li>• {t('botChecklistRisk')}</li>
              </ul>
              <p className="text-xs text-white/45">
                {t('botDisclaimer')}
              </p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}