// src/components/EmotionDetectionModule.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const INITIAL_METRICS = {
  emotion: '—',
  stress: 0.2,
  confidence: 0.6,
  wpm: null,
  fillersPerMin: null,
};

const AUDIO_AI_URL = process.env.REACT_APP_AUDIO_AI_URL;

const FILLER_WORDS = ['euh', 'heu', 'uh', 'hum', 'hmm'];

const VIDEO_EMOTION_LABELS = {
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
};

function translateVideoEmotion(raw = '') {
  if (!raw) {
    return null;
  }
  const key = raw.toLowerCase();
  if (VIDEO_EMOTION_LABELS[key]) {
    return VIDEO_EMOTION_LABELS[key];
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

function resolveEmotion(stress, confidence) {
  if (stress > 0.75) {
    return 'Stressé';
  }
  if (confidence > 0.72 && stress < 0.55) {
    return 'Confiant';
  }
  if (stress < 0.32 && confidence >= 0.5) {
    return 'Calme';
  }
  if (confidence < 0.35 && stress > 0.5) {
    return 'Tendu';
  }
  return 'Concentré';
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

function deriveCoachCue({ stress, confidence, fillersPerMin, wpm }) {
  if (stress > 0.72 || (Number.isFinite(fillersPerMin) && fillersPerMin > 6)) {
    return 'On respire 10 secondes, relâche les épaules et reprends avec un rythme posé.';
  }
  if (confidence < 0.4 && Number.isFinite(fillersPerMin) && fillersPerMin >= 3) {
    return 'Formule un objectif simple en une phrase avant de continuer. Ça clarifie le message.';
  }
  if (confidence > 0.7 && stress < 0.6 && Number.isFinite(wpm) && wpm >= 90) {
    return 'Super énergie ! Propose-toi un mini-challenge de 2 minutes pour pousser un argument.';
  }
  if (confidence < 0.45) {
    return 'Prends 2 inspirations profondes et recentre ton message sur une idée maîtresse.';
  }
  return 'Maintiens ce ton clair. Garde le regard sur ton plan et avance étape par étape.';
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

function summarizeVoice(stress, confidence, pitch) {
  if (!Number.isFinite(stress) || !Number.isFinite(confidence)) {
    return "Je capte ta voix, continue à parler pour une analyse complète.";
  }
  if (stress > 0.7 && confidence < 0.45) {
    return "Tension élevée détectée : on ralentit et on relâche les épaules avant de poursuivre.";
  }
  if (stress > 0.6 && confidence >= 0.45) {
    return "Beaucoup d'énergie ! Canalise-la en clarifiant ce que tu veux exprimer maintenant.";
  }
  if (confidence > 0.7 && stress < 0.5) {
    return "Voix stable et assurée, parfait pour dérouler ton plan.";
  }
  if (confidence < 0.45 && stress < 0.5) {
    return "Ton ton est calme mais hésitant : formule ta prochaine idée en une phrase forte.";
  }
  if (pitch && pitch > 280 && stress > 0.5) {
    return "La voix monte beaucoup, signe d'émotion. Ralentis et respire pour garder la clarté.";
  }
  return "Voix équilibrée : reste sur ce rythme et articule tes idées principales.";
}

function computeSummaryAdvice(averages) {
  const suggestions = [];

  if (averages.stress > 0.65) {
    suggestions.push('Prépare un rituel de reset (respiration, ancrage) avant ta prochaine session.');
  }
  if (averages.confidence < 0.45) {
    suggestions.push('Écris ton intention en une phrase clé et répète-la à voix haute avant de démarrer.');
  }
  if (averages.fillers > 4) {
    suggestions.push('Pratique un silence conscient : marque une pause dès que tu sens venir un “euh”.');
  }
  if (averages.wpm > 110) {
    suggestions.push('Travaille ton rythme : lis un passage lentement pour t’habituer à ralentir.');
  }
  if (averages.confidence > 0.7 && averages.stress < 0.55) {
    suggestions.push('Challenge bonus : expose une idée complexe en 120 secondes lors de la prochaine séance.');
  }
  if (suggestions.length < 3) {
    suggestions.push('Répète la structure “Situation - Action - Résultat” pour fluidifier ton discours.');
  }
  if (suggestions.length < 3) {
    suggestions.push('Installe-toi dans un environnement calme et vérifie ton matériel audio à l’avance.');
  }
  if (suggestions.length < 3) {
    suggestions.push('Hydrate-toi 10 minutes avant la session pour soutenir la qualité de ta voix.');
  }

  return suggestions.slice(0, 3);
}

function DualLineChart({ history }) {
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
        Aucune donnée disponible pour cette session.
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
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-rose-500 transition-all duration-500"
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
      setVideoError('Impossible de charger les modèles d’analyse vidéo.');
      setVideoEnabled(false);
      setVideoStatus('idle');
      return null;
    }
  }, [setVideoEnabled, setVideoStatus]);

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
    if (!payload || !payload.label) {
      videoEmotionRef.current = null;
      setVideoEmotion(null);
      return;
    }

    const mappedDistribution = (payload.distribution || []).map(item => ({
      label: translateVideoEmotion(item.emotion || item.label || ''),
      score: item.score ?? 0,
    }));

    const data = {
      label: payload.label,
      raw: payload.raw || null,
      score: clamp(payload.score ?? 0, 0, 1),
      distribution: mappedDistribution,
    };

    videoEmotionRef.current = data;
    setVideoEmotion(data);

    const stats = videoStatsRef.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!stats.lastTimestamp || now - stats.lastTimestamp > 900) {
      stats.counts[data.label] = (stats.counts[data.label] || 0) + 1;
      stats.total = (stats.total || 0) + 1;
      stats.lastTimestamp = now;
    }
  }, []);

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
              label: translateVideoEmotion(top.emotion || top.label),
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
  }, [ensureHumanInstance, updateVideoEmotionState, videoEnabled]);

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
      setVideoError('La caméra n’est pas disponible sur ce navigateur.');
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
      setVideoError('Accès caméra refusé. Vérifie les permissions de ton navigateur.');
      setVideoStatus('idle');
      setVideoEnabled(false);
    }
  }, [resetVideoStats, sessionRunning, stopVideoProcessing, videoEnabled]);

  const requestConsent = async () => {
    setError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setError('Le microphone n’est pas disponible sur ce navigateur.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach(track => track.stop());
      setConsentGranted(true);
    } catch (err) {
      console.error(err);
      setError('Impossible d’accéder au microphone. Vérifie les permissions de ton navigateur.');
    }
  };

  const startRecognition = () => {
    if (!recognitionSupported) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
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
        const cleaned = finalTranscript.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿñæœ\s]/gi, ' ');
        const words = cleaned.split(/\s+/).filter(Boolean);
        const fillers = words.filter(word => FILLER_WORDS.includes(word));

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
      setError('Le microphone n’est pas disponible sur ce navigateur.');
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
          setVideoError('Impossible d’activer la caméra. Passage en mode vocal uniquement.');
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
      setError('Analyse indisponible. Vérifie que le micro est bien accessible.');
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
        setVoiceAiError('AI voice analysis unavailable, falling back to local metrics.');
      }
    },
    [setVoiceAiError, setVoiceInsights],
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
        const emotion = overrideEmotion || resolveEmotion(stress, confidence);

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
          summary: summarizeVoice(combinedVoiceStress, combinedVoiceConfidence, signal.pitch),
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
    const entries = Object.entries(videoStats?.counts || {});
    const totalVideoSamples =
      videoStats?.total ??
      entries.reduce((acc, [, count]) => acc + count, 0);
    let videoMeta = null;

    if (entries.length && totalVideoSamples > 0) {
      const sorted = [...entries].sort((a, b) => b[1] - a[1]);
      videoMeta = {
        dominant: sorted[0][0],
        total: totalVideoSamples,
        distribution: sorted.slice(0, 4).map(([label, count]) => ({
          label,
          ratio: count / totalVideoSamples,
        })),
      };
    }

    setSummary({
      averages,
      advice: computeSummaryAdvice(averages),
      history: [...targetHistory],
      video: videoMeta,
    });
  };

  const coachMessage = useMemo(() => deriveCoachCue(metrics), [metrics]);

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

  return (
    <section className="mt-16">
      <div className="rounded-3xl border border-emerald-500/30 bg-black/70 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
        <header className="space-y-2 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">ACI Meta Coach</p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Module de détection d’émotions (voix + caméra)
          </h2>
          <p className="max-w-2xl text-base text-white/70 leading-relaxed">
            Analyse en direct de la voix pour aider le coach à adapter ses messages : émotion dominante,
            niveau de stress, confiance, rythme de parole et hésitations. Active aussi la caméra pour enrichir
            l’analyse via les expressions faciales (traitement 100% local dans le navigateur).
          </p>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-emerald-200/90">
          <span className="rounded-full bg-emerald-500/10 px-4 py-1">
            Analyse vocale active pour mieux t’adapter en temps réel.
          </span>
          <button
            type="button"
            onClick={toggleVideoMode}
            disabled={sessionRunning || videoStatus === 'checking'}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-white/70 transition ${
              videoEnabled
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-300/60'
                : 'border-white/10 hover:border-emerald-400/60 hover:text-emerald-200'
            } ${
              sessionRunning
                ? 'cursor-not-allowed opacity-60'
                : videoStatus === 'checking'
                  ? 'cursor-progress opacity-60'
                  : ''
            }`}
            title={
              sessionRunning
                ? 'Arrête la session pour modifier l’analyse vidéo.'
                : videoEnabled
                  ? 'Désactiver l’analyse vidéo'
                  : 'Activer l’analyse vidéo'
            }
          >
            <span className="inline-flex h-3 w-6 items-center rounded-full bg-white/10 px-0.5">
              <span
                className={`h-2 w-2 rounded-full transition ${
                  videoStatus === 'checking'
                    ? 'bg-amber-300'
                    : videoEnabled
                      ? 'bg-emerald-400'
                      : 'bg-white/30'
                }`}
              />
            </span>
            {videoStatus === 'checking'
              ? 'Autorisation caméra...'
              : videoEnabled
                ? 'Analyse vidéo activée'
                : 'Activer l’analyse vidéo'}
          </button>
        </div>

        {!consentGranted && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 className="text-lg font-semibold">Consentement requis</h3>
            <p className="mt-2 text-sm text-white/70">
              Pour lancer la détection d’émotions, autorise l’accès au microphone. Le flux audio reste local,
              seules les métriques calculées sont affichées.
            </p>
            <button
              onClick={requestConsent}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Autoriser l’analyse vocale
            </button>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        )}

        {consentGranted && !sessionRunning && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-white space-y-4">
            <p className="text-sm text-white/70">
              Tout est prêt pour une session voix. Clique sur démarrer et parle comme en situation réelle.
              Tu peux stopper à tout moment pour consulter le bilan de fin de session.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={startSession}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Commencer une session
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
                {videoEnabled
                  ? videoStatus === 'ready'
                    ? 'Caméra prête'
                    : 'Caméra activée'
                  : videoStatus === 'checking'
                    ? 'Autorisation caméra...'
                    : 'Activer la caméra'}
              </button>
            </div>
            {summary && (
              <p className="text-xs text-white/50">
                Résultat précédent disponible plus bas.
              </p>
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
                          {(videoEmotion.score * 100).toFixed(0)}% confiance
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-white/60">
                        {videoStatus === 'analysis'
                          ? 'Analyse vidéo en cours...'
                          : 'Caméra prête, maintien ton visage face à l’objectif.'}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">Émotion</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{metrics.emotion}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">Vitesse de parole</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatRate(metrics.wpm, 0)} <span className="text-sm text-white/60">mots/min</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">“Euh” par minute</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatRate(metrics.fillersPerMin, 1)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase text-white/50 tracking-wide">Analyse vocale IA</p>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    {voiceInsights?.summary
                      ? voiceInsights.summary
                      : voiceAiError
                        ? voiceAiError
                        : "Je mesure ton ton, ton énergie et ta stabilité pour ajuster ton coaching en direct."}
                  </p>
                </div>
              </div>

              <MetricBar label="Stress" value={metrics.stress} />
              <MetricBar label="Confiance" value={metrics.confidence} />

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-white">
                <p className="text-xs uppercase text-emerald-200 tracking-wide">Coach</p>
                <p className="mt-2 text-base leading-relaxed text-emerald-50">{coachMessage}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
              <div className="space-y-2">
                <p className="text-sm uppercase text-white/60 tracking-wide">Session en cours</p>
                <p className="text-base text-white/70">
                  Les métriques sont mises à jour toutes les 750 ms pour garder un affichage fluide.
                </p>
                {videoError && (
                  <p className="text-xs text-rose-300">
                    {videoError}
                  </p>
                )}
                {voiceAiError && (
                  <p className="text-xs text-amber-300">
                    {voiceAiError}
                  </p>
                )}
              </div>
              <button
                onClick={() => stopSession()}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-rose-400"
              >
                Arrêter et afficher le bilan
              </button>
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-white space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold">Bilan de la session</h3>
              <span className="text-sm text-white/60">
                Stress (rose) • Confiance (vert) sur {summary.history.length} points
              </span>
            </div>

            <DualLineChart history={summary.history} />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase text-white/50 tracking-wide">Stress moyen</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.stress * 100, 0)}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase text-white/50 tracking-wide">Confiance moyenne</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.confidence * 100, 0)}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase text-white/50 tracking-wide">Rythme global</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.wpm, 0)} mots/min
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:col-span-3">
                <p className="text-xs uppercase text-white/50 tracking-wide">“Euh” moyen</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRate(summary.averages.fillers, 1)} par minute
                </p>
              </div>
              {summary.video && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:col-span-3">
                  <p className="text-xs uppercase text-white/50 tracking-wide">Émotions visuelles détectées</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Dominante : {summary.video.dominant}
                    </span>
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
              <p className="text-sm uppercase text-white/60 tracking-wide">3 conseils pour la prochaine fois</p>
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
                Relancer une session
              </button>
              <p className="text-xs text-white/50">
                Les données restent côté navigateur. Relance la détection quand tu veux.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
