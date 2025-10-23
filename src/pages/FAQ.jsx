import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FAQPage() {
  const { t } = useTranslation();
  const items = t('faqPage.items', { returnObjects: true }) ?? [];
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = index => {
    setOpenIndex(prev => (prev === index ? -1 : index));
  };

  return (
    <div className="py-20 text-white">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t('faqPage.title')}</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
          {t('faqPage.intro')}
        </p>
      </header>

      <section className="mt-16 mx-auto max-w-3xl space-y-4">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <article
              key={item.question}
              className="rounded-3xl border border-white/15 bg-black/60 p-6 shadow-lg shadow-black/30 transition hover:border-[#10b981]/60"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between text-left text-base font-semibold"
              >
                <span className="text-balance">{item.question}</span>
                <span className="ml-4 text-[#10b981]">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  {item.answer}
                </p>
              )}
            </article>
          );
        })}
      </section>

      <div className="mt-16 rounded-3xl border border-emerald-500/25 bg-black/70 p-6 text-center text-sm text-white/70 shadow-xl shadow-emerald-500/10">
        <p>{t('faqPage.moreQuestions')}</p>
      </div>
    </div>
  );
}
