import React from 'react';
import { useTranslation } from 'react-i18next';
import RoadmapSection from '../components/RoadmapSection';

export default function RoadmapPage() {
  const { t } = useTranslation();

  return (
    <div className="py-20 text-white">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t('roadmapPage.title')}</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
          {t('roadmapPage.intro')}
        </p>
      </header>

      <div className="mt-12">
        <RoadmapSection showTitle={false} />
      </div>
    </div>
  );
}
