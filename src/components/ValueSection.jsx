// src/components/ValueSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const values = t => [
  { title: t('homeValuePremiumTitle'), desc: t('homeValuePremiumDesc') },
  { title: t('homeValueBotTitle'), desc: t('homeValueBotDesc') },
  { title: t('homeValuePrivateTitle'), desc: t('homeValuePrivateDesc') },
  { title: t('homeValueUtilityTitle'), desc: t('homeValueUtilityDesc') },
  { title: t('homeValueCommunityTitle'), desc: t('homeValueCommunityDesc') },
  { title: t('homeValueSecurityTitle'), desc: t('homeValueSecurityDesc') },
];

export default function ValueSection() {
  const { t } = useTranslation();
  const items = values(t);

  return (
    <section className="w-full px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        {/* Top row */}
        <div className="flex w-full flex-wrap justify-center gap-6 md:justify-start md:ml-[-140px]">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="w-full max-w-sm rounded-2xl border border-yellow-400/70 bg-black/70 p-6 text-white shadow-lg shadow-yellow-500/10 transition-transform duration-300 hover:-translate-y-1 sm:w-[300px]"
            >
              <h3 className="text-lg font-semibold text-yellow-400 sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex w-full flex-wrap justify-center gap-6 md:justify-end md:mr-[-140px]">
          {items.slice(3).map((item, idx) => (
            <div
              key={idx}
              className="w-full max-w-sm rounded-2xl border border-yellow-400/70 bg-black/70 p-6 text-white shadow-lg shadow-yellow-500/10 transition-transform duration-300 hover:-translate-y-1 sm:w-[300px]"
            >
              <h3 className="text-lg font-semibold text-yellow-400 sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
