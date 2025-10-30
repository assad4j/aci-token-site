import React, { lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CoachIASection from '../components/CoachIASection';

const CoachBusinessModule = lazy(() => import('../components/coach/CoachBusinessModule'));
const EmotionDetectionModule = lazy(() => import('../components/EmotionDetectionModule'));
const Coach3DModule = lazy(() => import('../components/coach/Coach3DModule'));

export default function CoachIAPage() {
  const { t, i18n } = useTranslation();
  const [emotionSnapshot, setEmotionSnapshot] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const languageKey = i18n.language || 'default';

  const coachEmotionState = useMemo(() => {
    if (!emotionSnapshot) {
      return undefined;
    }
    return {
      ...emotionSnapshot,
    };
  }, [emotionSnapshot]);

  return (
    <div className="py-20">
      <div className="mb-12 text-center text-white">
        <h1 className="text-4xl font-bold sm:text-5xl">{t('coachIAPage.title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 leading-relaxed">
          {t('coachIAPage.intro')}
        </p>
      </div>
      <CoachIASection variant="page" />
      <Suspense fallback={<HeavyFeatureFallback />}>
        <CoachBusinessModule key={`business-${languageKey}`} />
        <EmotionDetectionModule
          key={`emotion-${languageKey}`}
          onEmotionStateChange={setEmotionSnapshot}
          onSessionToggle={setSessionActive}
        />
        <Coach3DModule
          key={`3d-${languageKey}`}
          emotionState={coachEmotionState}
          isEmotionStreamLive={sessionActive}
        />
      </Suspense>
    </div>
  );
}

function HeavyFeatureFallback() {
  const { t } = useTranslation();
  return (
    <div className="mt-16 rounded-3xl border border-white/15 bg-black/50 p-8 text-center text-sm text-white/70">
      {t('coachIAPage.loading')}
    </div>
  );
}
