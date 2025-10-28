import React, { lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CoachIASection from '../components/CoachIASection';
import CoachBusinessModule from '../components/coach/CoachBusinessModule';
import useIsMobile from '../hooks/useIsMobile';

const EmotionDetectionModule = lazy(() => import('../components/EmotionDetectionModule'));
const Coach3DModule = lazy(() => import('../components/coach/Coach3DModule'));

export default function CoachIAPage() {
  const { t } = useTranslation();
  const [emotionSnapshot, setEmotionSnapshot] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const isMobile = useIsMobile();

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
      {isMobile ? (
        <MobileCoachPreview />
      ) : (
        <Suspense fallback={<HeavyFeatureFallback />}>
          <EmotionDetectionModule
            onEmotionStateChange={setEmotionSnapshot}
            onSessionToggle={setSessionActive}
          />
          <Coach3DModule emotionState={coachEmotionState} isEmotionStreamLive={sessionActive} />
        </Suspense>
      )}
    </div>
  );
}

function HeavyFeatureFallback() {
  return (
    <div className="mt-16 rounded-3xl border border-white/15 bg-black/50 p-8 text-center text-sm text-white/70">
      Chargement des modules interactifs…
    </div>
  );
}

function MobileCoachPreview() {
  return (
    <div className="mt-16 space-y-6 rounded-3xl border border-white/15 bg-black/60 p-8 text-white shadow-2xl shadow-black/40 backdrop-blur">
      <h2 className="text-2xl font-semibold text-[#10b981]">
        Aperçu mobile du Coach IA
      </h2>
      <p className="text-sm leading-relaxed text-white/70">
        Les démos interactives (analyse émotionnelle en temps réel et coach 3D animé) demandent une
        caméra et un moteur 3D qui ne sont pas encore optimisés pour les mobiles. Accédez au site
        depuis un ordinateur pour lancer ces expériences, ou inscrivez-vous à la newsletter pour être
        averti de la version mobile.
      </p>
      <ul className="space-y-3 text-sm text-white/75">
        <li>• Tableau de bord Business & AI disponible dès maintenant</li>
        <li>• Tutoriels mindset et routines guidées accessibles sur mobile</li>
        <li>• Version mobile des analyses vidéo en cours d’optimisation</li>
      </ul>
    </div>
  );
}
