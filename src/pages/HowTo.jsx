import React from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../components/PageWrapper';

export default function HowToPage() {
  const { t } = useTranslation();

  // Palette verte (emerald)
  const cardClass =
    'min-w-0 rounded-3xl border border-[#10b981]/30 bg-black/60 p-6 sm:p-8 shadow-xl shadow-[#10b981]/15 backdrop-blur';
  const headingClass =
    'text-2xl font-semibold text-emerald-200 mb-4 text-balance';
  const paragraphClass = 'text-sm leading-relaxed text-white/75';

  return (
    <PageWrapper>
      <div className="min-h-screen text-white pt-0 px-0 pb-0">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-4xl">
          {t('howtoTitle')}
        </h1>

        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Étapes */}
          <div className={cardClass}>
            <h2 className={headingClass}>{t('howtoStepsTitle')}</h2>
            <ol className="space-y-3 text-sm text-white/80">
              {t('howtoSteps', { returnObjects: true }).map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#10b981]/40 text-emerald-200 text-sm font-semibold">
                    {step.step}
                  </span>
                  <span className="leading-relaxed">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* FAQ intégrée */}
          <div className={cardClass}>
            <h2 className={headingClass}>{t('howtoFaqTitle')}</h2>
            <ul className="space-y-3 text-sm text-white/75">
              {t('howtoFaq', { returnObjects: true }).map((faq, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="block font-semibold text-emerald-200">{faq.question}</span>
                  <span>{faq.answer}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sécurité */}
          <div className={cardClass}>
            <h2 className={headingClass}>{t('howtoSecurityTitle')}</h2>
            {t('howtoSecurity', { returnObjects: true }).map((line, idx) => (
              <p key={idx} className={`${paragraphClass} mb-2`}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}