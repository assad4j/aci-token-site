import { useCallback, useEffect, useRef, useState } from 'react';

const UNSUPPORTED_ERROR = 'SpeechRecognition non supporté (Chrome ou Edge recommandé en HTTPS).';

export function useSpeechFR(onTranscript, { timeoutMs = 12000 } = {}) {
  const recognizerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [supported, setSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');

  const clearCountdown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition);

    if (!SpeechRecognition) {
      setSupported(false);
      setError(UNSUPPORTED_ERROR);
      return undefined;
    }

    const recognizer = new SpeechRecognition();
    recognizer.lang = 'fr-FR';
    recognizer.interimResults = false;
    recognizer.continuous = false;
    recognizer.maxAlternatives = 1;

    recognizer.onresult = event => {
      clearCountdown();
      const text = event?.results?.[0]?.[0]?.transcript || '';
      if (text) {
        setTranscript(text);
        onTranscript?.(text);
      }
    };

    recognizer.onerror = event => {
      clearCountdown();
      if (event?.error === 'no-speech') {
        setError("Aucune voix détectée. Essaie de parler plus près du micro.");
      } else if (event?.error === 'not-allowed') {
        setError('Permission micro refusée. Autorise l’accès dans ton navigateur.');
      } else {
        setError(event?.error || 'Erreur micro');
      }
    };

    recognizer.onend = () => {
      clearCountdown();
      setIsListening(false);
    };

    recognizerRef.current = recognizer;
    return () => {
      clearCountdown();
      recognizer.stop();
      recognizerRef.current = null;
    };
  }, [clearCountdown, onTranscript]);

  const stop = useCallback(() => {
    clearCountdown();
    recognizerRef.current?.stop();
  }, [clearCountdown]);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    if (!recognizerRef.current) {
      setSupported(false);
      setError(UNSUPPORTED_ERROR);
      return;
    }
    try {
      recognizerRef.current.start();
      setIsListening(true);
      if (timeoutMs > 0) {
        timeoutRef.current = setTimeout(() => {
          setError("Temps d'écoute dépassé (timeout)");
          stop();
        }, timeoutMs);
      }
    } catch (err) {
      setError(err?.message || String(err));
    }
  }, [stop, timeoutMs]);

  return {
    supported,
    isListening,
    start,
    stop,
    error,
    transcript,
  };
}
