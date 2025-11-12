// src/components/EmotionDetectionModule.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const INITIAL_METRICS = {
  emotion: '—',
  stress: 0.2,
  confidence: 0.6,
  wpm: null,
  fillersPerMin: null,
};

const AUDIO_AI_URL = process.env.REACT_APP_AUDIO_AI_URL;

const DEFAULT_TRANSLATIONS = {
  recognitionLang: 'fr-FR',
  fillerWords: ['euh', 'heu', 'uh', 'hum', 'hmm'],
  labels: {
    angry: 'Colère',
    disgusted: 'Dégoût',
    disgust: 'Dégoût',
    fear: 'Craintif',
    fearful: 'Craintif',
    happy: 'Joyeux',
    sad: 'Triste',
    surprise: 'Surpris',
    surprised: 'Surpris',
    neutral: 'Neutre',
    calm: 'Calme',
    bored: 'Distrait',
    sleepy: 'Somnolent',
    serious: 'Sérieux',
    confused: 'Perplexe',
    excited: 'Enthousiaste',
    smile: 'Sourire',
  },
  ui: {
    badge: 'ACI EmotionScan',
    title: 'ACI EmotionScan — Voix + Vision',
    description:
      'EmotionScan capte la voix, la vidéo et le rythme pour cartographier stress, confiance et posture mentale en temps réel. Tout est traité côté navigateur avant d’alimenter ton plan SmartTrader.',
    voiceHint: 'EmotionScan ajuste tes routines en fonction de ta voix à chaque seconde.',
    toggle: {
      tooltipSession: 'Arrête la session pour modifier l’analyse vidéo.',
      tooltipActive: 'Désactiver l’analyse vidéo',
      tooltipInactive: 'Activer l’analyse vidéo',
      indicatorOn: 'bg-emerald-400',
      indicatorOff: 'bg-white/30',
      indicatorChecking: 'bg-amber-300',
      textChecking: 'Autorisation caméra...',
      textEnabled: 'Analyse vidéo activée',
      textDisabled: 'Activer l’analyse vidéo',
    },
    consent: {
      title: 'Consentement requis',
      description:
        'Pour lancer la détection d’émotions, autorise l’accès au microphone. Le flux audio reste local, seules les métriques calculées sont affichées.',
      button: 'Autoriser l’analyse vocale',
    },
    preSession: {
      intro:
        'Tout est prêt pour une session voix. Clique sur démarrer et parle comme en situation réelle. Tu peux stopper à tout moment pour consulter le bilan de fin de session.',
      startButton: 'Commencer une session',
      videoOn: 'Caméra activée',
      videoReady: 'Caméra prête',
      videoOff: 'Activer la caméra',
      videoChecking: 'Autorisation caméra...',
      previousSummaryNote: 'Résultat précédent disponible plus bas.',
    },
    session: {
      title: 'Session EmotionScan',
      description:
        'Les métriques sont mises à jour toutes les 750 ms pour garder un affichage fluide.',
      stopButton: 'Arrêter et afficher le bilan',
      videoConfidence: '{{value}}% confiance',
      metricEmotion: 'Émotion',
      metricSpeechRate: 'Vitesse de parole',
      metricFillers: '“Euh” par minute',
      metricVoiceAi: 'Analyse vocale IA',
      voiceInsightsHint:
        'Analyse IA live : ton, énergie, stabilité émotionnelle et recommandations SmartTrader.',
      coachLabel: 'IA Coach',
    },
    summary: {
      title: 'Bilan de la session',
      legend: 'Stress (rose) • Confiance (vert) sur {{points}} points',
      stress: 'Stress moyen',
      confidence: 'Confiance moyenne',
      pace: 'Rythme global',
      paceUnit: 'mots/min',
      fillers: '“Euh” moyen',
      fillersUnit: 'par minute',
      videoTitle: 'Émotions visuelles détectées',
      dominant: 'Dominante : {{label}}',
      adviceTitle: '3 conseils pour la prochaine fois',
      restartButton: 'Relancer une session',
      restartNote: 'Les données restent côté navigateur. Relance la détection quand tu veux.',
    },
    chart: {
      empty: 'Aucune donnée disponible pour cette session.',
    },
    coachMessageLabel: 'Message du coach',
    sessionStatus: 'Session en cours',
  },
  errors: {
    micUnavailable: 'Le microphone n’est pas disponible sur ce navigateur.',
    micDenied: 'Impossible d’accéder au microphone. Vérifie les permissions de ton navigateur.',
    cameraUnavailable: 'La caméra n’est pas disponible sur ce navigateur.',
    cameraDenied: 'Accès caméra refusé. Vérifie les permissions de ton navigateur.',
    analysisUnavailable: 'Analyse indisponible. Vérifie que le micro est bien accessible.',
    videoModelsFailed: 'Impossible de charger les modèles d’analyse vidéo.',
    videoFallback: 'Impossible d’activer la caméra. Passage en mode vocal uniquement.',
    voiceAiFallback: 'Analyse IA de la voix indisponible. Utilisation des métriques locales.',
  },
  status: {
    videoChecking: 'Autorisation caméra...',
    videoReady: 'Caméra prête',
    videoEnabled: 'Caméra activée',
    videoDisabled: 'Activer la caméra',
    videoAnalysis: 'Analyse vidéo en cours...',
    videoReminder: 'Caméra prête, maintien ton visage face à l’objectif.',
  },
  coachCue: {
    highStress: 'On respire 10 secondes, relâche les épaules et reprends avec un rythme posé.',
    lowConfidenceFillers:
      'Formule un objectif simple en une phrase avant de continuer. Ça clarifie le message.',
    energetic:
      'Super énergie ! Propose-toi un mini-challenge de 2 minutes pour pousser un argument.',
    lowConfidence:
      'Prends 2 inspirations profondes et recentre ton message sur une idée maîtresse.',
    balanced:
      'Maintiens ce ton clair. Garde le regard sur ton plan et avance étape par étape.',
  },
  voiceSummary: {
    awaiting: 'Je capte ta voix, continue à parler pour une analyse complète.',
    highStressLowConfidence:
      'Tension élevée détectée : on ralentit et on relâche les épaules avant de poursuivre.',
    highStress:
      'Beaucoup d’énergie ! Canalise-la en clarifiant ce que tu veux exprimer maintenant.',
    highConfidence:
      'Voix stable et assurée, parfait pour dérouler ton plan.',
    lowConfidence:
      'Ton ton est calme mais hésitant : formule ta prochaine idée en une phrase forte.',
    highPitch:
      'La voix monte beaucoup, signe d’émotion. Ralentis et respire pour garder la clarté.',
    balanced:
      'Voix équilibrée : reste sur ce rythme et articule tes idées principales.',
  },
  advice: {
    reset: 'Prépare un rituel de reset (respiration, ancrage) avant ta prochaine session.',
    intention:
      'Écris ton intention en une phrase clé et répète-la à voix haute avant de démarrer.',
    pause: 'Pratique un silence conscient : marque une pause dès que tu sens venir un “euh”.',
    slowDown: 'Travaille ton rythme : lis un passage lentement pour t’habituer à ralentir.',
    challenge: 'Challenge bonus : expose une idée complexe en 120 secondes lors de la prochaine séance.',
    structure:
      'Répète la structure “Situation - Action - Résultat” pour fluidifier ton discours.',
    setup:
      'Installe-toi dans un environnement calme et vérifie ton matériel audio à l’avance.',
    hydrate: 'Hydrate-toi 10 minutes avant la session pour soutenir la qualité de ta voix.',
  },
  emotionNames: {
    fallback: 'Concentré',
    stressed: 'Stressé',
    confident: 'Confiant',
    calm: 'Calme',
    tense: 'Tendu',
  },
};

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') {
    return target;
  }
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      target[key] = deepMerge({ ...target[key] }, sourceValue);
    } else {
      target[key] = Array.isArray(sourceValue) ? [...sourceValue] : sourceValue;
    }
  });
  return target;
}

function translateVideoEmotion(raw = '', labelsMap = DEFAULT_TRANSLATIONS.labels) {
  if (!raw) {
    return null;
  }
  const key = raw.toLowerCase();
  if (labelsMap && labelsMap[key]) {
    return labelsMap[key];
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function deriveVideoMetrics(emotionData) {
  if (!emotionData?.label) {
    return null;
  }

  const { label, score = 0.5 } = emotionData;
  const intensity = clamp(score, 0.15, 1);
  const normalizedLabel = label.toLowerCase();
  let stress = 0.5;
  let confidence = 0.5;

  if (['colère', 'stressé', 'tendu', 'craintif', 'dégoût'].some(item => normalizedLabel.includes(item))) {
    stress = 0.75;
    confidence = 0.35;
  } else if (['triste', 'perplexe', 'distra', 'somnolent'].some(item => normalizedLabel.includes(item))) {
    stress = 0.6;
    confidence = 0.3;
  } else if (['surpris', 'surprise'].some(item => normalizedLabel.includes(item))) {
    stress = 0.55;
    confidence = 0.55;
  } else if (['joie', 'joyeux', 'enthousias', 'sourire', 'calme', 'neutre'].some(item => normalizedLabel.includes(item))) {
    stress = 0.3;
    confidence = 0.72;
  } else {
    stress = 0.48;
    confidence = 0.5;
  }

  return {
    stress: clamp(stress * intensity + (1 - intensity) * 0.5, 0, 1),
    confidence: clamp(confidence * intensity + (1 - intensity) * 0.5, 0, 1),
  };
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smooth(previous, next, weight = 0.25) {
  if (previous === null || Number.isNaN(previous)) {
    return next;
  }
  return previous * (1 - weight) + next * weight;
}

function formatRate(value, decimals = 0) {
  if (!Number.isFinite(value) || value < 0) {
    return '—';
  }
  return Number(value).toFixed(decimals);
}

function resolveEmotion(stress, confidence, names = {}) {
  const fallback = names.fallback || 'Concentré';
  const labelStressed = names.stressed || 'Stressé';
  const labelConfident = names.confident || 'Confiant';
  const labelCalm = names.calm || 'Calme';
  const labelTense = names.tense || 'Tendu';
  if (stress > 0.75) {
    return labelStressed;
  }
  if (confidence > 0.72 && stress < 0.55) {
    return labelConfident;
  }
  if (stress < 0.32 && confidence >= 0.5) {
    return labelCalm;
  }
  if (confidence < 0.35 && stress > 0.5) {
    return labelTense;
  }
  return fallback;
}

function normalizeEmotionLabel(raw) {
  if (!raw) {
    return 'neutral';
  }
  const label = raw.toString().toLowerCase();
  if (label.includes('jo') || label.includes('heureux') || label.includes('sour')) {
    return 'joy';
  }
  if (label.includes('calm') || label.includes('zen')) {
    return 'calm';
  }
  if (label.includes('stress') || label.includes('tendu') || label.includes('ango') || label.includes('peur')) {
    return 'stress';
  }
  if (label.includes('trist') || label.includes('fatigu')) {
    return 'sad';
  }
  if (label.includes('colèr') || label.includes('anger') || label.includes('rage')) {
    return 'anger';
  }
  if (label.includes('confian')) {
    return 'confident';
  }
  if (label.includes('enthous') || label.includes('excited')) {
    return 'excited';
  }
  if (label.includes('neutre')) {
    return 'neutral';
  }
  return 'neutral';
}

function deriveCoachCue({ stress, confidence, fillersPerMin, wpm }, cues = DEFAULT_TRANSLATIONS.coachCue) {
  if (stress > 0.72 || (Number.isFinite(fillersPerMin) && fillersPerMin > 6)) {
    return cues.highStress || DEFAULT_TRANSLATIONS.coachCue.highStress;
  }
  if (confidence < 0.4 && Number.isFinite(fillersPerMin) && fillersPerMin >= 3) {
    return cues.lowConfidenceFillers || DEFAULT_TRANSLATIONS.coachCue.lowConfidenceFillers;
  }
  if (confidence > 0.7 && stress < 0.6 && Number.isFinite(wpm) && wpm >= 90) {
    return cues.energetic || DEFAULT_TRANSLATIONS.coachCue.energetic;
  }
  if (confidence < 0.45) {
    return cues.lowConfidence || DEFAULT_TRANSLATIONS.coachCue.lowConfidence;
  }
  return cues.balanced || DEFAULT_TRANSLATIONS.coachCue.balanced;
}

function estimatePitch(buffer, sampleRate) {
  if (!buffer || buffer.length === 0) return null;
  const SIZE = 1024;
  const MAX_OFFSET = Math.min(SIZE - 1, 1023);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;
  for (let i = 0; i < SIZE; i += 1) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) {
    return null;
  }
  let lastCorrelation = 1;
  const correlations = new Array(MAX_OFFSET).fill(0);
  let found = false;
  for (let offset = 2; offset < MAX_OFFSET; offset += 1) {
    let correlation = 0;
    for (let i = 0; i < SIZE; i += 1) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / SIZE;
    correlations[offset] = correlation;
    if (correlation > 0.9 && correlation > lastCorrelation) {
      found = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (found) {
      if (bestOffset > 1 && bestOffset < MAX_OFFSET - 1) {
        const forward = correlations[bestOffset + 1] ?? correlations[bestOffset];
        const backward = correlations[bestOffset - 1] ?? correlations[bestOffset];
        const shift = forward - backward;
        const adjustedOffset = bestOffset + (shift / (2 * correlations[bestOffset]) || 0);
        return sampleRate / adjustedOffset;
      }
      return sampleRate / bestOffset;
    }
    lastCorrelation = correlation;
  }
  if (bestCorrelation > 0.01 && bestOffset > 0) {
    return sampleRate / bestOffset;
  }
  return null;
}

function summarizeVoice(stress, confidence, pitch, summaryStrings = DEFAULT_TRANSLATIONS.voiceSummary) {
  if (!Number.isFinite(stress) || !Number.isFinite(confidence)) {
    return summaryStrings.awaiting || DEFAULT_TRANSLATIONS.voiceSummary.awaiting;
  }
  if (stress > 0.7 && confidence < 0.45) {
    return summaryStrings.highStressLowConfidence || DEFAULT_TRANSLATIONS.voiceSummary.highStressLowConfidence;
  }
  if (stress > 0.6 && confidence >= 0.45) {
    return summaryStrings.highStress || DEFAULT_TRANSLATIONS.voiceSummary.highStress;
  }
  if (confidence > 0.7 && stress < 0.5) {
    return summaryStrings.highConfidence || DEFAULT_TRANSLATIONS.voiceSummary.highConfidence;
  }
  if (confidence < 0.45 && stress < 0.5) {
    return summaryStrings.lowConfidence || DEFAULT_TRANSLATIONS.voiceSummary.lowConfidence;
  }
  if (pitch && pitch > 280 && stress > 0.5) {
    return summaryStrings.highPitch || DEFAULT_TRANSLATIONS.voiceSummary.highPitch;
  }
  return summaryStrings.balanced || DEFAULT_TRANSLATIONS.voiceSummary.balanced;
}

function computeSummaryAdvice(averages, adviceStrings = DEFAULT_TRANSLATIONS.advice) {
  const suggestions = [];

  if (averages.stress > 0.65) {
    suggestions.push(adviceStrings.reset || DEFAULT_TRANSLATIONS.advice.reset);
  }
  if (averages.confidence < 0.45) {
    suggestions.push(adviceStrings.intention || DEFAULT_TRANSLATIONS.advice.intention);
  }
  if (averages.fillers > 4) {
    suggestions.push(adviceStrings.pause || DEFAULT_TRANSLATIONS.advice.pause);
  }
  if (averages.wpm > 110) {
    suggestions.push(adviceStrings.slowDown || DEFAULT_TRANSLATIONS.advice.slowDown);
  }
  if (averages.confidence > 0.7 && averages.stress < 0.55) {
    suggestions.push(adviceStrings.challenge || DEFAULT_TRANSLATIONS.advice.challenge);
  }
  if (suggestions.length < 3) {
    suggestions.push(adviceStrings.structure || DEFAULT_TRANSLATIONS.advice.structure);
  }
  if (suggestions.length < 3) {
    suggestions.push(adviceStrings.setup || DEFAULT_TRANSLATIONS.advice.setup);
  }
  if (suggestions.length < 3) {
    suggestions.push(adviceStrings.hydrate || DEFAULT_TRANSLATIONS.advice.hydrate);
  }

  return suggestions.slice(0, 3);
}

function DualLineChart({ history, emptyLabel }) {
  const chartData = useMemo(() => {
    if (!history.length) {
      return null;
    }

    const pointsCount = history.length;
    const width = 100;
    const height = 100;

    const toPoints = key =>
      history
        .map((entry, index) => {
          const x = (index / (pointsCount - 1 || 1)) * width;
          const y = height - entry[key] * height;
          return `${x},${y}`;
        })
        .join(' ');

    return {
      stress: toPoints('stress'),
      confidence: toPoints('confidence'),
    };
  }, [history]);

  if (!chartData) {
    return (
      <div className="h-40 w-full rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60">
        {emptyLabel}
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-40 w-full rounded-2xl border border-white/10 bg-black/40 p-2 text-white"
    >
      <polyline
        points={chartData.stress}
        fill="none"
        stroke="rgb(244, 63, 94)"
        strokeWidth="2"
      />
      <polyline
        points={chartData.confidence}
        fill="none"
        stroke="rgb(16, 185, 129)"
        strokeWidth="2"
      />
    </svg>
  );
}

function MetricBar({ label, value }) {
  const widthPercent = `${clamp(value, 0, 1) * 100}%`;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm uppercase text-white/60 tracking-wide">
        <span>{label}</span>
        <span>{formatRate(value * 100, 0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: widthPercent }}
        />
      </div>
    </div>
  );
}

export default function EmotionDetectionModule({
  onMetricsChange,
  onEmotionStateChange,
  onSessionToggle,
} = {}) {
  const { t, i18n } = useTranslation();
  const futuristicFont = '"Space Grotesk","Orbitron","Inter",sans-serif';
  const dictionary = useMemo(
    () => t('emotionDetection', { returnObjects: true }) || {},
    [i18n.language, t]
  );
  const strings = useMemo(
    () => deepMerge(JSON.parse(JSON.stringify(DEFAULT_TRANSLATIONS)), dictionary),
    [dictionary]
  );
  const {
    recognitionLang,
    fillerWords,
    labels,
    ui,
    errors,
    status,
    coachCue,
    voiceSummary,
    advice,
    emotionNames,
  } = strings;
  const fillerWordsSet = useMemo(
    () => new Set((fillerWords || []).map(word => word.toLowerCase())),
    [fillerWords]
  );
  const placeholderContent = dictionary?.placeholder || null;
  const showPlaceholder = Boolean(placeholderContent && !dictionary?.ui);

  const [consentGranted, setConsentGranted] = useState(false);
  const [sessionRunning, setSessionRunning] = useState(false);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [videoStatus, setVideoStatus] = useState('idle');
  const [videoEmotion, setVideoEmotion] = useState(null);
  const [voiceInsights, setVoiceInsights] = useState(null);
  const [voiceAiError, setVoiceAiError] = useState(null);
  const historyRef = useRef([]);
  const videoEmotionRef = useRef(null);
  const videoStatsRef = useRef({ counts: {}, lastTimestamp: 0, total: 0 });
  const humanRef = useRef(null);
  const videoRef = useRef(null);
  const videoAnimationRef = useRef(null);
  const voiceInsightsRef = useRef(null);

  const recognitionSupported = useMemo(() => {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  const liveEmotionState = useMemo(() => {
    const stressScore = clamp(metrics?.stress ?? 0, 0, 1);
    const confidenceScore = clamp(metrics?.confidence ?? 0.5, 0, 1);
    const normalizedEmotion = normalizeEmotionLabel(metrics?.emotion);
    const wpm = Number.isFinite(metrics?.wpm) ? metrics.wpm : null;
    const speakingDerived = wpm != null ? clamp((wpm - 60) / 80, 0, 1) : 0.45;
    const arousal = clamp(speakingDerived * 0.6 + stressScore * 0.4, 0, 1);
    const valence = clamp(0.5 + (confidenceScore - stressScore) * 0.5, 0, 1);
    return {
      emotion: normalizedEmotion,
      stressScore,
      valence,
      arousal,
      confidence: confidenceScore,
    };
  }, [metrics]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const analyseIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const wordsStatsRef = useRef({
    totalWords: 0,
    fillerCount: 0,
    estimatedWords: 0,
  });
  const speakingStateRef = useRef({
    wasSpeaking: false,
    burstCount: 0,
    volumeHistory: [],
    speakingSamples: 0,
    totalSamples: 0,
  });
  const voiceBaselineRef = useRef({
    energy: null,
    pitch: null,
  });
  const lastAiCallRef = useRef(0);
  const sessionStartRef = useRef(null);
  const recognitionRef = useRef(null);
  const runningRef = useRef(false);

  const resetVideoStats = useCallback(() => {
    videoStatsRef.current = { counts: {}, lastTimestamp: 0, total: 0 };
    videoEmotionRef.current = null;
    setVideoEmotion(null);
  }, []);

  const ensureHumanInstance = useCallback(async () => {
    if (humanRef.current) {
      return humanRef.current;
    }
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const module = await import('@vladmandic/human');
      const HumanCtor = module?.default || module?.Human || module;
      const human = new HumanCtor({
        cacheSensitivity: 0,
        modelBasePath: 'https://vladmandic.github.io/human/models/',
        face: {
          enabled: true,
          detector: { rotation: true, maxDetected: 1 },
          mesh: { enabled: false },
          attention: { enabled: false },
          description: { enabled: false },
          iris: { enabled: false },
          emotion: { enabled: true },
        },
        hand: { enabled: false },
        body: { enabled: false },
        gesture: { enabled: false },
        segmentation: { enabled: false },
        filter: { enabled: true },
      });

      await human.load();
      humanRef.current = human;
      return human;
    } catch (err) {
      console.error('Impossible de charger Human', err);
      setVideoError(errors.videoModelsFailed || DEFAULT_TRANSLATIONS.errors.videoModelsFailed);
      setVideoEnabled(false);
      setVideoStatus('idle');
      return null;
    }
  }, [errors, setVideoEnabled, setVideoError, setVideoStatus]);

  const stopVideoProcessing = useCallback(() => {
    if (videoAnimationRef.current) {
      cancelAnimationFrame(videoAnimationRef.current);
      videoAnimationRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore pause errors
      }
      videoRef.current.srcObject = null;
    }
    videoEmotionRef.current = null;
    setVideoEmotion(null);
    setVideoStatus(prev => (videoEnabled || prev === 'analysis' ? 'ready' : 'idle'));
  }, [videoEnabled]);

  const updateVideoEmotionState = useCallback(payload => {
    if (!payload || (!payload.label && !payload.raw)) {
      videoEmotionRef.current = null;
      setVideoEmotion(null);
      return;
    }
    const rawLabel = (payload.raw || payload.label || '').toString();
    const mappedDistribution = (payload.distribution || []).map(item => {
      const rawEmotion = (item.emotion || item.label || '').toString();
      return {
        label: translateVideoEmotion(rawEmotion, labels),
        raw: rawEmotion,
        score: item.score ?? 0,
      };
    });
    const translatedLabel = translateVideoEmotion(rawLabel, labels);
    const data = {
      label: translatedLabel,
      raw: rawLabel || null,
      score: clamp(payload.score ?? 0, 0, 1),
      distribution: mappedDistribution,
    };

    videoEmotionRef.current = data;
    setVideoEmotion(data);

    const stats = videoStatsRef.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!stats.lastTimestamp || now - stats.lastTimestamp > 900) {
      const key = rawLabel.toLowerCase();
      if (key) {
        const current = stats.counts[key] || { raw: rawLabel, count: 0 };
        current.raw = rawLabel;
        current.count += 1;
        stats.counts[key] = current;
      }
      stats.total = (stats.total || 0) + 1;
      stats.lastTimestamp = now;
    }
  }, [labels]);

  const startVideoProcessing = useCallback(async () => {
    if (!videoEnabled || !videoRef.current) {
      return;
    }
    const human = await ensureHumanInstance();
    if (!human) {
      return;
    }

    setVideoStatus('analysis');

    const analyse = async () => {
      if (!runningRef.current) {
        return;
      }
      if (!videoRef.current || videoRef.current.readyState < 2) {
        videoAnimationRef.current = requestAnimationFrame(analyse);
        return;
      }

      try {
        const result = await human.detect(videoRef.current);
        if (result?.face?.length) {
          const face = result.face[0];
          const emotions = face.emotion || [];
          if (emotions.length) {
            const top = emotions.reduce(
              (best, current) => (current.score > best.score ? current : best),
              emotions[0]
            );
            updateVideoEmotionState({
              label: translateVideoEmotion(top.emotion || top.label, labels),
              raw: top.emotion || top.label,
              score: top.score,
              distribution: emotions,
            });
          } else {
            updateVideoEmotionState(null);
          }
        } else {
          updateVideoEmotionState(null);
        }
      } catch (err) {
        console.error('Erreur lors de la détection vidéo', err);
      }

      videoAnimationRef.current = requestAnimationFrame(analyse);
    };

    videoAnimationRef.current = requestAnimationFrame(analyse);
  }, [ensureHumanInstance, labels, updateVideoEmotionState, videoEnabled]);

  const toggleVideoMode = useCallback(async () => {
    if (sessionRunning) {
      return;
    }
    if (videoEnabled) {
      stopVideoProcessing();
      resetVideoStats();
      setVideoEnabled(false);
      setVideoStatus('idle');
      setVideoError(null);
      return;
    }

    setVideoError(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setVideoError(errors.cameraUnavailable || DEFAULT_TRANSLATIONS.errors.cameraUnavailable);
      return;
    }

    setVideoStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      stream.getTracks().forEach(track => track.stop());
      setVideoEnabled(true);
      setVideoStatus('ready');
    } catch (err) {
      console.error(err);
      setVideoError(errors.cameraDenied || DEFAULT_TRANSLATIONS.errors.cameraDenied);
      setVideoStatus('idle');
      setVideoEnabled(false);
    }
  }, [errors, resetVideoStats, sessionRunning, stopVideoProcessing, videoEnabled]);

  const requestConsent = async () => {
    setError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setError(errors.micUnavailable || DEFAULT_TRANSLATIONS.errors.micUnavailable);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach(track => track.stop());
      setConsentGranted(true);
    } catch (err) {
      console.error(err);
      setError(errors.micDenied || DEFAULT_TRANSLATIONS.errors.micDenied);
    }
  };

  const startRecognition = () => {
    if (!recognitionSupported) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang || DEFAULT_TRANSLATIONS.recognitionLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        const cleaned = finalTranscript
          .toLocaleLowerCase(i18n.language || undefined)
          .replace(/[^\p{L}\s'-]/gu, ' ');
        const words = cleaned.split(/\s+/).filter(Boolean);
        const fillers = words.filter(word => fillerWordsSet.has(word));

        wordsStatsRef.current.totalWords += words.length;
        wordsStatsRef.current.fillerCount += fillers.length;
      }
    };

    recognition.onerror = event => {
      console.warn('Speech recognition error', event.error);
    };

    recognition.onend = () => {
      if (runningRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.warn('Unable to restart recognition', error);
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const releaseResources = useCallback(() => {
    runningRef.current = false;

    if (analyseIntervalRef.current) {
      clearInterval(analyseIntervalRef.current);
      analyseIntervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    sessionStartRef.current = null;
    voiceBaselineRef.current = { energy: null, pitch: null };
    lastAiCallRef.current = 0;
    setVoiceInsights(null);
    setVoiceAiError(null);
    stopVideoProcessing();
    stopRecognition();
  }, [stopRecognition, stopVideoProcessing]);

  useEffect(() => {
    return () => {
      releaseResources();
    };
  }, [releaseResources]);

  useEffect(() => {
    if (!sessionRunning || !videoEnabled) {
      return;
    }

    const stream = mediaStreamRef.current;
    if (!stream || typeof stream.getVideoTracks !== 'function') {
      return;
    }

    const hasVideoTrack = stream.getVideoTracks().length > 0;
    if (!hasVideoTrack) {
      setVideoStatus('idle');
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (videoElement.srcObject !== stream) {
      videoElement.srcObject = stream;
    }

    videoElement.muted = true;
    videoElement.playsInline = true;
    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }

    if (!videoAnimationRef.current) {
      startVideoProcessing();
    }
  }, [sessionRunning, startVideoProcessing, videoEnabled, setVideoStatus]);

  const startSession = async () => {
    setError(null);
    setVideoError(null);
    setSummary(null);
    setHistory([]);
    historyRef.current = [];
    setMetrics({ ...INITIAL_METRICS });
    resetVideoStats();
    setVideoStatus(videoEnabled ? 'starting' : 'idle');

    speakingStateRef.current = {
      wasSpeaking: false,
      burstCount: 0,
      volumeHistory: [],
      speakingSamples: 0,
      totalSamples: 0,
    };
    wordsStatsRef.current = {
      totalWords: 0,
      fillerCount: 0,
      estimatedWords: 0,
      fillersPerMin: null,
    };
    voiceBaselineRef.current = { energy: null, pitch: null };
    lastAiCallRef.current = 0;
    setVoiceInsights(null);
    setVoiceAiError(null);

    let videoActive = videoEnabled;

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setError(errors.micUnavailable || DEFAULT_TRANSLATIONS.errors.micUnavailable);
      return;
    }

    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: videoActive
            ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            : false,
        });
      } catch (videoErr) {
        if (videoActive) {
          console.error('Video capture unavailable, fallback to audio only', videoErr);
          setVideoError(errors.videoFallback || DEFAULT_TRANSLATIONS.errors.videoFallback);
          setVideoStatus('idle');
          setVideoEnabled(false);
          videoActive = false;
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } else {
          throw videoErr;
        }
      }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch {
          // ignore resume errors
        }
      }
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      mediaStreamRef.current = stream;

      if (videoActive) {
        setVideoStatus('starting');
      }

      sessionStartRef.current = performance.now();
      runningRef.current = true;
      setSessionRunning(true);

      startRecognition();
      scheduleAnalysis();
    } catch (err) {
      console.error(err);
      setError(errors.analysisUnavailable || DEFAULT_TRANSLATIONS.errors.analysisUnavailable);
      releaseResources();
      setSessionRunning(false);
    }
  };

  const stopSession = ({ withSummary = true } = {}) => {
    setSessionRunning(false);
    releaseResources();
    if (withSummary) {
      const snapshot = historyRef.current;
      if (snapshot.length) {
        computeSummary(snapshot);
      }
    }
  };

  const analyseAudioFrame = () => {
    if (!analyserRef.current) {
      return null;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i += 1) {
      sumSquares += dataArray[i] * dataArray[i];
    }

    const rms = Math.sqrt(sumSquares / bufferLength);
    const normalizedVolume = clamp(rms / 0.15, 0, 1);
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const pitch = estimatePitch(dataArray, sampleRate);

    const state = speakingStateRef.current;
    state.volumeHistory.push(normalizedVolume);
    if (state.volumeHistory.length > 120) {
      state.volumeHistory.shift();
    }

    const speakingThreshold = 0.12;
    const speaking = normalizedVolume > speakingThreshold;

    if (speaking && !state.wasSpeaking) {
      state.burstCount += 1;
    }

    state.wasSpeaking = speaking;
    state.speakingSamples += speaking ? 1 : 0;
    state.totalSamples += 1;

    const avgVolume =
      state.volumeHistory.reduce((acc, value) => acc + value, 0) /
      state.volumeHistory.length;

    const variance =
      state.volumeHistory.reduce((acc, value) => acc + (value - avgVolume) ** 2, 0) /
      Math.max(1, state.volumeHistory.length - 1);

    if (!recognitionSupported) {
      const estimatedWords = state.burstCount * 3.2;
      wordsStatsRef.current.estimatedWords = estimatedWords;
    }

    return {
      normalizedVolume,
      variance,
      speakingRatio: state.speakingSamples / Math.max(1, state.totalSamples),
      pitch,
      rms,
    };
  };

  const deriveVoiceScores = useCallback(features => {
    if (!features) {
      return {
        stress: 0.35,
        confidence: 0.55,
      };
    }
    const baseline = voiceBaselineRef.current;
    if (baseline.energy == null) {
      baseline.energy = features.rms;
      baseline.pitch = features.pitch || 180;
    } else {
      baseline.energy = baseline.energy * 0.98 + features.rms * 0.02;
      if (features.pitch) {
        baseline.pitch = baseline.pitch * 0.97 + features.pitch * 0.03;
      }
    }

    const energyDelta = features.rms - (baseline.energy || features.rms);
    const pitchDelta =
      features.pitch && baseline.pitch ? (features.pitch - baseline.pitch) / Math.max(1, baseline.pitch) : 0;
    const speakingRatio = features.speakingRatio;
    const variance = features.variance;

    let stressScore = clamp(0.3 + energyDelta * 6 + variance * 0.6 + pitchDelta * 2, 0, 1);
    let confidenceScore = clamp(0.5 + (speakingRatio - 0.4) * 0.6 - variance * 0.25 - energyDelta * 1.2, 0, 1);

    if (Number.isFinite(wordsStatsRef.current.fillersPerMin)) {
      const fillerRate = wordsStatsRef.current.fillersPerMin;
      stressScore += clamp(fillerRate * 0.05, 0, 0.2);
      confidenceScore -= clamp(fillerRate * 0.04, 0, 0.2);
    }

    return {
      stress: clamp(stressScore, 0, 1),
      confidence: clamp(confidenceScore, 0, 1),
    };
  }, []);

  const callVoiceAi = useCallback(
    async features => {
      if (!AUDIO_AI_URL || !features) return;
      const now = performance.now();
      if (now - lastAiCallRef.current < 5000) return;
      lastAiCallRef.current = now;
      try {
        const payload = {
          rms: features.rms,
          variance: features.variance,
          speakingRatio: features.speakingRatio,
          pitch: features.pitch,
          fillersPerMin: Number.isFinite(wordsStatsRef.current.fillersPerMin)
            ? wordsStatsRef.current.fillersPerMin
            : null,
        };
        const response = await fetch(AUDIO_AI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`audio_ai_${response.status}`);
        }
        const data = await response.json();
        if (data && typeof data === 'object') {
          setVoiceInsights({
            summary: data.summary || null,
            stress: typeof data.stress === 'number' ? clamp(data.stress, 0, 1) : null,
            confidence: typeof data.confidence === 'number' ? clamp(data.confidence, 0, 1) : null,
            source: 'ai',
            timestamp: performance.now(),
          });
          setVoiceAiError(null);
        }
      } catch (error) {
        console.warn('[emotion/audio] ai analysis failed', error);
        setVoiceAiError(errors.voiceAiFallback || DEFAULT_TRANSLATIONS.errors.voiceAiFallback);
      }
    },
    [errors],
  );

  const scheduleAnalysis = () => {
    if (analyseIntervalRef.current) {
      clearInterval(analyseIntervalRef.current);
    }

    analyseIntervalRef.current = setInterval(() => {
      const frame = analyseAudioFrame();
      if (!sessionStartRef.current) {
        return;
      }
      if (!frame && !videoEmotionRef.current) {
        return;
      }

      const elapsedMs = performance.now() - sessionStartRef.current;
      const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60);
      const spokenWords = wordsStatsRef.current.totalWords || wordsStatsRef.current.estimatedWords || 0;
      const fillers = wordsStatsRef.current.fillerCount;

      const wpm = spokenWords / elapsedMinutes;
      const fillersRate = fillers / elapsedMinutes;
      wordsStatsRef.current.fillersPerMin = Number.isFinite(fillersRate) ? fillersRate : null;

      const signal = frame || { normalizedVolume: 0.15, variance: 0.04, speakingRatio: 0.45, rms: 0.05 };
      const voiceScores = deriveVoiceScores(signal);
      const stressLocal = clamp(0.25 + signal.normalizedVolume * 0.6 + signal.variance * 0.2, 0, 1);
      const confidenceLocal = clamp(
        0.4 + signal.speakingRatio * 0.35 - signal.variance * 0.15 + (1 - stressLocal) * 0.35,
        0,
        1,
      );
      const combinedVoiceStress = clamp(voiceScores.stress * 0.6 + stressLocal * 0.4, 0, 1);
      const combinedVoiceConfidence = clamp(voiceScores.confidence * 0.6 + confidenceLocal * 0.4, 0, 1);
      callVoiceAi(signal);

      setMetrics(previous => {
        let stress = smooth(previous.stress ?? 0.2, combinedVoiceStress, 0.22);
        let confidence = smooth(previous.confidence ?? 0.6, combinedVoiceConfidence, 0.22);

        const videoMetrics = videoEmotionRef.current ? deriveVideoMetrics(videoEmotionRef.current) : null;
        if (videoMetrics) {
          stress = smooth(stress, videoMetrics.stress, 0.35);
          confidence = smooth(confidence, videoMetrics.confidence, 0.35);
        }
        const aiVoice = voiceInsightsRef.current;
        if (aiVoice) {
          if (typeof aiVoice.stress === 'number') {
            stress = smooth(stress, clamp(aiVoice.stress, 0, 1), 0.2);
          }
          if (typeof aiVoice.confidence === 'number') {
            confidence = smooth(confidence, clamp(aiVoice.confidence, 0, 1), 0.2);
          }
        }

        const overrideEmotion = videoEmotionRef.current?.label;
        const emotion = overrideEmotion || resolveEmotion(stress, confidence, emotionNames);

        const currentMetrics = {
          emotion,
          stress,
          confidence,
          wpm: Number.isFinite(wpm) ? wpm : null,
          fillersPerMin: Number.isFinite(fillersRate) ? fillersRate : null,
        };

        setHistory(prevHistory => {
          const item = {
            time: elapsedMs / 1000,
            stress,
            confidence,
            wpm: currentMetrics.wpm,
            fillers: currentMetrics.fillersPerMin,
          };
          const nextHistory = [...prevHistory, item];
          if (nextHistory.length > 180) {
            nextHistory.shift();
          }
          historyRef.current = nextHistory;
          return nextHistory;
        });

        return currentMetrics;
      });
      setVoiceInsights(current => {
        const aiActiveRecently =
          current?.source === 'ai' && typeof current.timestamp === 'number'
            ? performance.now() - current.timestamp < 6000
            : false;
        if (aiActiveRecently) {
          return current;
        }
        const deltaStress = Math.abs((current?.stress ?? 0) - combinedVoiceStress);
        const deltaConf = Math.abs((current?.confidence ?? 0) - combinedVoiceConfidence);
        if (current?.source === 'local' && deltaStress < 0.03 && deltaConf < 0.03) {
          return current;
        }
        return {
          summary: summarizeVoice(
            combinedVoiceStress,
            combinedVoiceConfidence,
            signal.pitch,
            voiceSummary,
          ),
          stress: combinedVoiceStress,
          confidence: combinedVoiceConfidence,
          source: 'local',
          timestamp: performance.now(),
        };
      });
    }, 750);
  };

  const computeSummary = (targetHistory = []) => {
    if (!targetHistory.length) {
      setSummary(null);
      return;
    }

    const aggregates = targetHistory.reduce(
      (acc, entry) => {
        acc.stress += entry.stress;
        acc.confidence += entry.confidence;
        if (Number.isFinite(entry.wpm)) {
          acc.wpmSum += entry.wpm;
          acc.wpmCount += 1;
        }
        if (Number.isFinite(entry.fillers)) {
          acc.fillers += entry.fillers;
          acc.fillersCount += 1;
        }
        return acc;
      },
      { stress: 0, confidence: 0, wpmSum: 0, wpmCount: 0, fillers: 0, fillersCount: 0 }
    );

    const total = targetHistory.length;
    const averages = {
      stress: aggregates.stress / total,
      confidence: aggregates.confidence / total,
      wpm: aggregates.wpmCount ? aggregates.wpmSum / aggregates.wpmCount : null,
      fillers: aggregates.fillersCount ? aggregates.fillers / aggregates.fillersCount : null,
    };

    const videoStats = videoStatsRef.current;
    const entries = Object.values(videoStats?.counts || {});
    const totalVideoSamples =
      videoStats?.total ??
      entries.reduce((acc, item) => acc + (item?.count ?? 0), 0);
    let videoMeta = null;

    if (entries.length && totalVideoSamples > 0) {
      const sorted = [...entries].sort((a, b) => (b?.count ?? 0) - (a?.count ?? 0));
      const dominantRaw = sorted[0]?.raw || '';
      videoMeta = {
        dominantRaw,
        dominant: translateVideoEmotion(dominantRaw, labels),
        total: totalVideoSamples,
        distribution: sorted.slice(0, 4).map(item => ({
          raw: item?.raw || '',
          label: translateVideoEmotion(item?.raw || '', labels),
          ratio: (item?.count ?? 0) / totalVideoSamples,
        })),
      };
    }

    setSummary({
      averages,
      advice: computeSummaryAdvice(averages, advice),
      history: [...targetHistory],
      video: videoMeta,
    });
  };

  const coachMessage = useMemo(() => deriveCoachCue(metrics, coachCue), [coachCue, metrics]);

  const videoToggleTitle = sessionRunning
    ? ui.toggle.tooltipSession || DEFAULT_TRANSLATIONS.ui.toggle.tooltipSession
    : videoEnabled
      ? ui.toggle.tooltipActive || DEFAULT_TRANSLATIONS.ui.toggle.tooltipActive
      : ui.toggle.tooltipInactive || DEFAULT_TRANSLATIONS.ui.toggle.tooltipInactive;

  const videoToggleText =
    videoStatus === 'checking'
      ? ui.toggle.textChecking || status.videoChecking || DEFAULT_TRANSLATIONS.status.videoChecking
      : videoEnabled
        ? ui.toggle.textEnabled || DEFAULT_TRANSLATIONS.ui.toggle.textEnabled
        : ui.toggle.textDisabled || DEFAULT_TRANSLATIONS.ui.toggle.textDisabled;

  const indicatorClass =
    videoStatus === 'checking'
      ? 'bg-amber-300'
      : videoEnabled
        ? 'bg-emerald-400'
        : 'bg-white/30';

  const cameraButtonLabel =
    videoEnabled
      ? videoStatus === 'ready'
        ? status.videoReady || DEFAULT_TRANSLATIONS.status.videoReady || ui.toggle.textEnabled
        : status.videoEnabled || DEFAULT_TRANSLATIONS.status.videoEnabled || ui.toggle.textEnabled
      : videoStatus === 'checking'
        ? status.videoChecking || DEFAULT_TRANSLATIONS.status.videoChecking
        : status.videoDisabled || DEFAULT_TRANSLATIONS.status.videoDisabled || ui.toggle.textDisabled;

  const videoStatusMessage =
    videoStatus === 'analysis'
      ? status.videoAnalysis || DEFAULT_TRANSLATIONS.status.videoAnalysis
      : status.videoReminder || DEFAULT_TRANSLATIONS.status.videoReminder;

  const summaryLegendText = summary
    ? (ui.summary.legend || DEFAULT_TRANSLATIONS.ui.summary.legend).replace(
        '{{points}}',
        summary.history.length,
      )
    : '';

  const dominantLabel = summary?.video
    ? (ui.summary.dominant || DEFAULT_TRANSLATIONS.ui.summary.dominant).replace(
        '{{label}}',
        summary.video.dominant,
      )
    : '';

  const paceUnit = ui.summary.paceUnit || DEFAULT_TRANSLATIONS.ui.summary.paceUnit;
  const fillersUnit = ui.summary.fillersUnit || DEFAULT_TRANSLATIONS.ui.summary.fillersUnit;

  useEffect(() => {
    voiceInsightsRef.current = voiceInsights;
  }, [voiceInsights]);

  useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange(metrics);
    }
  }, [metrics, onMetricsChange]);

  useEffect(() => {
    if (onEmotionStateChange) {
      onEmotionStateChange(liveEmotionState);
    }
  }, [liveEmotionState, onEmotionStateChange]);

  useEffect(() => {
    if (onSessionToggle) {
      onSessionToggle(sessionRunning);
    }
  }, [sessionRunning, onSessionToggle]);

  if (showPlaceholder && placeholderContent) {
    return (
      <section className="relative mt-16" style={{ fontFamily: futuristicFont }}>
        <div className="relative overflow-hidden rounded-[40px] border border-cyan-400/20 bg-gradient-to-br from-[#030b1f] via-[#050d22] to-[#021327] p-10 text-white shadow-[0_40px_120px_-55px_rgba(59,130,246,0.85)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#38bdf8,transparent_60%),radial-gradient(circle_at_bottom,#10b981,transparent_45%)] opacity-45" />
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0px,transparent_2px,transparent_140px)] opacity-20 animate-[emotionScan_10s_linear_infinite]" />

          <header className="relative space-y-3">
            <p className="text-xs uppercase tracking-[0.45em] text-white/70">{ui.badge}</p>
            <h2 className="text-3xl font-semibold text-white drop-shadow-[0_0_25px_rgba(56,189,248,0.7)]">
              {placeholderContent.title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/75">
              {placeholderContent.description}
            </p>
          </header>
          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              {placeholderContent.cta}
            </a>
            <p className="text-sm text-white/60">{placeholderContent.note}</p>
          </div>
        </div>
        <style>{`
          @keyframes emotionScan {
            0% { transform: translateX(0); }
            100% { transform: translateX(-140px); }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="relative mt-16" style={{ fontFamily: futuristicFont }}>
      <div className="relative overflow-hidden rounded-[40px] border border-cyan-400/20 bg-gradient-to-br from-[#020b18] via-[#050f23] to-[#02132b] p-8 text-white shadow-[0_45px_130px_-60px_rgba(16,185,129,0.8)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#38bdf8,transparent_60%),radial-gradient(circle_at_bottom,#10b981,transparent_50%)] opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.08)_0px,transparent_2px,transparent_120px)] opacity-15 animate-[emotionScan_12s_linear_infinite]" />

        <header className="relative space-y-2 text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-white/60">{ui.badge}</p>
          <h2 className="text-3xl font-semibold md:text-4xl">{ui.title}</h2>
          <p className="max-w-2xl text-base text-white/75 leading-relaxed">{ui.description}</p>
        </header>

        <div className="relative mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-white/70">
            {ui.voiceHint}
          </span>
          <button
            type="button"
            onClick={toggleVideoMode}
            disabled={sessionRunning || videoStatus === 'checking'}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-white/70 transition ${
              videoEnabled
                ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200 hover:border-cyan-200/80'
                : 'border-white/10 hover:border-cyan-300/70 hover:text-cyan-200'
            } ${
              sessionRunning
                ? 'cursor-not-allowed opacity-60'
                : videoStatus === 'checking'
                  ? 'cursor-progress opacity-60'
                  : ''
            }`}
            title={videoToggleTitle}
          >
            <span className="inline-flex h-3 w-6 items-center rounded-full bg-white/10 px-0.5">
              <span className={`h-2 w-2 rounded-full transition ${indicatorClass}`} />
            </span>
            {videoToggleText}
          </button>
        </div>

        {!consentGranted && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 className="text-lg font-semibold">{ui.consent.title}</h3>
            <p className="mt-2 text-sm text-white/70">{ui.consent.description}</p>
            <button
              onClick={requestConsent}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              {ui.consent.button}
            </button>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        )}

        {consentGranted && !sessionRunning && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-white space-y-4">
            <p className="text-sm text-white/70">{ui.preSession.intro}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={startSession}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                {ui.preSession.startButton}
              </button>
              <button
                onClick={toggleVideoMode}
                disabled={videoStatus === 'checking'}
                className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition ${
                  videoEnabled
                    ? 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-300/60'
                    : 'border border-white/20 text-white/70 hover:border-emerald-400/60 hover:text-emerald-200'
                } ${videoStatus === 'checking' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {cameraButtonLabel}
              </button>
            </div>
            {summary && (
              <p className="text-xs text-white/50">{ui.preSession.previousSummaryNote}</p>
            )}
            {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
            {videoError && <p className="text-xs text-rose-300">{videoError}</p>}
          </div>
        )}

        {sessionRunning && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white space-y-6">
              {(videoEnabled || videoEmotion) && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="block h-full min-h-[220px] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-sm text-white">
                    {videoEmotion?.label ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold">{videoEmotion.label}</span>
                        <span className="text-xs text-white/60">
                          {(ui.session.videoConfidence || DEFAULT_TRANSLATIONS.ui.session.videoConfidence).replace(
                            '{{value}}',
                            (videoEmotion.score * 100).toFixed(0),
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-white/60">{videoStatusMessage}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">{ui.session.metricEmotion}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{metrics.emotion || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">{ui.session.metricSpeechRate}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatRate(metrics.wpm, 0)}{' '}
                    <span className="text-sm text-white/60">{paceUnit}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">{ui.session.metricFillers}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatRate(metrics.fillersPerMin, 1)}{' '}
                    <span className="text-sm text-white/60">{fillersUnit}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">{ui.session.metricVoiceAi}</p>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    {voiceInsights?.summary
                      ? voiceInsights.summary
                      : voiceAiError
                        ? voiceAiError
                        : ui.session.voiceInsightsHint}
                  </p>
                </div>
              </div>

              <MetricBar label={ui.summary.stress} value={metrics.stress} />
              <MetricBar label={ui.summary.confidence} value={metrics.confidence} />

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-white">
                <p className="text-xs uppercase text-emerald-200 tracking-wide">{ui.session.coachLabel}</p>
                <p className="mt-2 text-base leading-relaxed text-emerald-50">{coachMessage}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
              <div className="space-y-2">
                <p className="text-sm uppercase text-white/60 tracking-wide">{ui.session.title}</p>
                <p className="text-base text-white/70">{ui.session.description}</p>
                {videoError && <p className="text-xs text-rose-300">{videoError}</p>}
                {voiceAiError && <p className="text-xs text-amber-300">{voiceAiError}</p>}
              </div>
              <button
                onClick={() => stopSession()}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-rose-400"
              >
                {ui.session.stopButton}
              </button>
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-white space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold">{ui.summary.title}</h3>
              <span className="text-sm text-white/60">{summaryLegendText}</span>
            </div>

            <DualLineChart
              history={summary.history}
              emptyLabel={ui.chart?.empty || DEFAULT_TRANSLATIONS.ui.chart.empty}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase text-white/50 tracking-wide">{ui.summary.stress}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.stress * 100, 0)}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase text-white/50 tracking-wide">{ui.summary.confidence}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.confidence * 100, 0)}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase text-white/50 tracking-wide">{ui.summary.pace}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.wpm, 0)} {paceUnit}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:col-span-3">
                <p className="text-xs uppercase text-white/50 tracking-wide">{ui.summary.fillers}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.fillers, 1)} {fillersUnit}
                </p>
              </div>
              {summary.video && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:col-span-3">
                  <p className="text-xs uppercase text-white/50 tracking-wide">{ui.summary.videoTitle}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <span className="rounded-full bg-white/10 px-3 py-1">{dominantLabel}</span>
                    {summary.video.distribution.map(item => (
                      <span
                        key={item.label}
                        className="rounded-full border border-white/10 px-3 py-1"
                      >
                        {item.label} · {formatRate(item.ratio * 100, 0)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm uppercase text-white/60 tracking-wide">{ui.summary.adviceTitle}</p>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {summary.advice.map((tip, index) => (
                  <li key={index} className="rounded-2xl border border-white/10 bg-black/40 p-3">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={startSession}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                {ui.summary.restartButton}
              </button>
              <p className="text-xs text-white/50">
                {ui.summary.restartNote}
              </p>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes emotionScan {
          0% { transform: translateY(0); }
          100% { transform: translateY(-120px); }
        }
      `}</style>
    </section>
  );
}
