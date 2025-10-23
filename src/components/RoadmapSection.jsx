// src/components/RoadmapSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function RoadmapSection({ showTitle = true }) {
  const { t } = useTranslation();
  const roadmapItems = t('roadmap.items', { returnObjects: true }) ?? [];
  const visionTitle = t('roadmap.visionTitle', { defaultValue: '' });
  const vision = t('roadmap.vision', { defaultValue: '' });
  const hasVisionTitle = typeof visionTitle === 'string' && visionTitle.trim().length > 0;
  const hasVision = typeof vision === 'string' && vision.trim().length > 0;
  const sectionPadding = showTitle ? 'py-20' : 'pt-10 pb-20';

  return (
    <section className={`${sectionPadding} px-6 text-white`}>
      {showTitle && (
        <h2 className="mb-12 text-center text-4xl font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
          {t('roadmap.title')}
        </h2>
      )}

      <div className="relative mx-auto max-w-4xl">
        <div className="absolute left-[11px] top-1 bottom-1 hidden w-px bg-gradient-to-b from-emerald-500/70 via-emerald-400/30 to-transparent sm:block" />
        <div className="space-y-10">
          {roadmapItems.map(item => (
            <article
              key={`${item.phase}-${item.title}`}
              className="group relative flex flex-col gap-2 rounded-2xl border border-emerald-500/10 bg-white/5/10 px-5 py-6 shadow-lg shadow-emerald-500/10 backdrop-blur transition hover:border-emerald-400/40 hover:shadow-emerald-500/40 sm:pl-12"
            >
              <span className="absolute left-0 top-7 hidden h-4 w-4 -translate-x-[9px] rounded-full border-2 border-emerald-400 bg-black/80 shadow-[0_0_12px_rgba(16,185,129,0.6)] sm:block" />
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">
                {item.phase}
              </p>
              <h3 className="text-xl font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-white/75">
                  {item.description}
                </p>
              )}
              {Array.isArray(item.objectives) && item.objectives.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-white/70">
                  {item.objectives.map(objective => (
                    <li key={objective} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
      {(hasVisionTitle || hasVision) && (
        <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-white shadow-xl shadow-emerald-500/20 backdrop-blur">
          {hasVisionTitle && (
            <h3 className="text-xl font-semibold text-emerald-200">
              {visionTitle}
            </h3>
          )}
          {hasVision && (
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              {vision}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
