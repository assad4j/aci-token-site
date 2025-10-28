import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CoachIASection from '../components/CoachIASection';
import EmotionDetectionModule from '../components/EmotionDetectionModule';
import CoachBusinessModule from '../components/coach/CoachBusinessModule';
import Coach3DModule from '../components/coach/Coach3DModule';

export default function CoachIAPage() {
  const { t } = useTranslation();
  const [emotionSnapshot, setEmotionSnapshot] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);

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
      <CoachBusinessModule />
      <EmotionDetectionModule
        onEmotionStateChange={setEmotionSnapshot}
        onSessionToggle={setSessionActive}
      />
      <Coach3DModule emotionState={coachEmotionState} isEmotionStreamLive={sessionActive} />
    </div>
  );
}
