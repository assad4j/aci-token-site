import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function useCoachTts({ lang, voiceHint } = {}) {
  const synth = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return window.speechSynthesis;
  }, []);

  const ttsSupported = Boolean(synth);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const pendingVoicesResolveRef = useRef(null);

  const cancel = useCallback(() => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onstart = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
    }
    if (ttsSupported && synth?.speaking) {
      synth.cancel();
    }
    setIsSpeaking(false);
  }, [synth, ttsSupported]);

  useEffect(() => {
    if (!synth) return undefined;
    const updateVoices = () => {
      const list = synth.getVoices ? synth.getVoices() : [];
      setVoices(list);
      if (pendingVoicesResolveRef.current) {
        pendingVoicesResolveRef.current(list);
        pendingVoicesResolveRef.current = null;
      }
    };

    updateVoices();
    let previousHandler = null;
    let overrideHandler = null;

    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', updateVoices);
    } else if ('onvoiceschanged' in synth) {
      previousHandler = synth.onvoiceschanged;
      overrideHandler = event => {
        if (typeof previousHandler === 'function') {
          previousHandler.call(synth, event);
        }
        updateVoices();
      };
      synth.onvoiceschanged = overrideHandler;
    }

    return () => {
      if (typeof synth.removeEventListener === 'function') {
        synth.removeEventListener('voiceschanged', updateVoices);
      }
      if (overrideHandler && synth.onvoiceschanged === overrideHandler) {
        synth.onvoiceschanged = previousHandler || null;
      }
    };
  }, [synth]);

  const ensureVoices = useCallback(() => {
    if (!synth) return Promise.resolve([]);
    const current = synth.getVoices ? synth.getVoices() : [];
    if (current.length > 0) {
      return Promise.resolve(current);
    }
    return new Promise(resolve => {
      pendingVoicesResolveRef.current = resolve;
    });
  }, [synth]);

  const chunkText = useCallback(input => {
    if (!input) return [];
    const pieces = [];
    const regex = /.{1,200}(?:\s|$)/g;
    const matches = input.match(regex);
    if (matches) {
      matches.forEach(part => {
        const trimmed = part.trim();
        if (trimmed) pieces.push(trimmed);
      });
    } else {
      pieces.push(input);
    }
    return pieces;
  }, []);

  const speak = useCallback(
    (text, { lang: overrideLang, voiceHint: overrideVoiceHint } = {}) =>
      new Promise(async resolve => {
        if (!ttsSupported || !synth) {
          resolve(false);
          return;
        }

        cancel();

        const resolvedLang = overrideLang || lang || navigator.language || 'en-US';
        const resolvedHint = (overrideVoiceHint || voiceHint || '').toLowerCase();
        const segments = chunkText(text);
        if (!segments.length) {
          resolve(false);
          return;
        }

        const pickVoice = list => {
          if (!Array.isArray(list) || list.length === 0) return null;
          const exactMatch = list.find(
            voice =>
              voice.lang &&
              voice.lang.toLowerCase().startsWith(resolvedLang.toLowerCase()) &&
              (!resolvedHint || voice.name?.toLowerCase().includes(resolvedHint))
          );
          if (exactMatch) return exactMatch;
          const baseLang = resolvedLang.split('-')[0];
          const baseMatch = list.find(
            voice =>
              voice.lang &&
              voice.lang.toLowerCase().startsWith(baseLang.toLowerCase()) &&
              (!resolvedHint || voice.name?.toLowerCase().includes(resolvedHint))
          );
          if (baseMatch) return baseMatch;
          if (resolvedHint) {
            const hintOnly = list.find(voice => voice.name?.toLowerCase().includes(resolvedHint));
            if (hintOnly) return hintOnly;
          }
          return list[0];
        };

        const available = voices.length ? voices : await ensureVoices();
        const selectedVoice = pickVoice(available);

        const playQueue = pieces => {
          if (!pieces.length) {
            setIsSpeaking(false);
            resolve(true);
            return;
          }
          const chunk = pieces.shift();
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = resolvedLang;
          if (selectedVoice) utterance.voice = selectedVoice;
          utterance.pitch = 1.05;
          utterance.rate = 0.95;
          utterance.volume = 0.92;
          utterance.onstart = () => {
            setIsSpeaking(true);
          };
          utterance.onend = () => {
            utteranceRef.current = null;
            playQueue(pieces);
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            resolve(false);
          };
          utteranceRef.current = utterance;
          synth.speak(utterance);
        };

        playQueue([...segments]);
      }),
    [cancel, chunkText, ensureVoices, lang, synth, ttsSupported, voiceHint, voices],
  );

  return {
    ttsSupported,
    isSpeaking,
    speak,
    cancel,
  };
}
