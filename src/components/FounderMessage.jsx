// src/components/FounderMessage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FounderMessage() {
  const { t } = useTranslation();

  return (
    <section className="mt-20 rounded-3xl border border-[#10b981]/25 bg-black/70 px-6 py-10 text-white shadow-xl shadow-[#10b981]/15">
      <h2 className="text-3xl font-semibold text-[#10b981] mb-4 text-balance">
        {t('founderMessage.title')}
      </h2>
      <p className="text-sm leading-relaxed text-white/75">
        {t('founderMessage.body')}
      </p>
    </section>
  );
}
