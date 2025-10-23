import React from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../components/PageWrapper';

export default function TokenomicsPage() {
  const { t } = useTranslation();

  // Palette verte
  const cardClass =
    'min-w-0 rounded-3xl border border-[#10b981]/30 bg-black/60 p-6 sm:p-8 shadow-xl shadow-[#10b981]/15 backdrop-blur';
  const headingClass =
    'text-xl font-semibold text-emerald-200 mb-3 text-balance';
  const paragraphClass = 'text-sm leading-relaxed text-white/75';

  return (
    <PageWrapper>
      <div className="min-h-screen text-white pt-0 px-0 pb-0">
        <div className="mb-10 space-y-3 text-balance">
          <h1 className="text-3xl font-bold sm:text-4xl">{t('tokenomicsTitle')}</h1>
          <p className="text-sm text-white/70 sm:text-base">{t('tokenomicsDesc')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className={cardClass}>
            <h2 className={headingClass}>{t('raiseGoalTitle')}</h2>
            <p className={paragraphClass}>
              {t('raiseGoalText', { amount: t('raiseGoalAmount') })}
            </p>
          </article>

          <article className={cardClass}>
            <h2 className={headingClass}>{t('founderRemunerationTitle')}</h2>
            <p className={paragraphClass}>
              {t('founderRemunerationText', { percent: t('founderRemunerationPercent') })}
            </p>
          </article>

          <article className={`${cardClass} md:col-span-2`}>
            <h2 className={headingClass}>{t('fundAllocationTitle')}</h2>
            <ul className="mt-3 space-y-3 text-sm text-white/75">
              {t('fundAllocationPoints', { returnObjects: true }).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-emerald-300 font-semibold">{item.percentage}</span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={`${cardClass} md:col-span-2`}>
            <h2 className={headingClass}>{t('tokenSupplyTitle')}</h2>
            <p className={paragraphClass}>
              {t('tokenSupplyText', { total: t('tokenSupplyTotal') })}
            </p>
          </article>
        </div>
      </div>
    </PageWrapper>
  );
}