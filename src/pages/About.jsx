import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();
  const cardClass = 'rounded-3xl border border-[#10b981]/30 bg-black/60 p-6 sm:p-8 shadow-xl shadow-[#10b981]/15 backdrop-blur min-w-0';
  const headingClass = 'text-2xl font-semibold text-[#10b981] mb-3 text-balance';
  const paragraphClass = 'text-sm leading-relaxed text-white/75';

  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-6 lg:px-20 space-y-10">
        <h2 className="text-3xl font-bold text-center text-white sm:text-4xl">
          {t('aboutSectionTitle')}
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className={cardClass}>
            <h3 className={headingClass}>{t('aboutMissionTitle')}</h3>
            <p className={paragraphClass}>{t('aboutMissionDesc')}</p>
          </article>

          <article className={cardClass}>
            <h3 className={headingClass}>{t('aboutOriginTitle')}</h3>
            <p className={`${paragraphClass} italic`}>{t('aboutOriginDesc')}</p>
          </article>

          <article className={`${cardClass} lg:col-span-2`}>
            <h3 className={headingClass}>{t('aboutCommitmentTitle')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              {t('aboutCommitmentPoints', { returnObjects: true }).map((point, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-[#10b981]">•</span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={cardClass}>
            <h3 className={headingClass}>{t('aboutCommunityTitle')}</h3>
            <p className={paragraphClass}>{t('aboutCommunityDesc')}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
