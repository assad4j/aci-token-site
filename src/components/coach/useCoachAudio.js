import { useCallback, useEffect, useRef, useState } from 'react';

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return undefined;
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
};

export default function useCoachAudio({ lang, onFinalTranscript } = {}) {
  const [sttSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  });
  const [micSupported] = useState(() => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
  const [permission, setPermission] = useState('unknown'); // unknown | granted | denied
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [amplitude, setAmplitude] = useState(0);

  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const frameRef = useRef(null);

  const stopAnalyser = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setAmplitude(0);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopAnalyser();
    setIsListening(false);
    setInterimTranscript('');
  }, [stopAnalyser]);

  const handleRecognitionResult = useCallback(
    event => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        setInterimTranscript(interim);
      }
      if (final) {
        const text = final.trim();
        setCurrentTranscript(text);
        setInterimTranscript('');
        onFinalTranscript?.(text);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
    },
    [onFinalTranscript],
  );

  const analyseAmplitude = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i += 1) {
      const value = dataArrayRef.current[i] - 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length) / 128;
    setAmplitude(Math.min(rms * 2, 1));
    frameRef.current = requestAnimationFrame(analyseAmplitude);
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return true;
    if (!micSupported) {
      setPermission('denied');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission('granted');
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      source.connect(analyserRef.current);
      analyseAmplitude();

      let recognitionStarted = true;
      if (sttSupported) {
        const RecognitionCtor = getSpeechRecognition();
        const recognition = RecognitionCtor ? new RecognitionCtor() : null;
        if (recognition) {
          recognition.lang = lang || navigator.language || 'en-US';
          recognition.interimResults = true;
          recognition.continuous = true;
          recognition.maxAlternatives = 1;
          recognition.onresult = handleRecognitionResult;
          recognition.onerror = event => {
            console.warn('[coach/audio] speech recognition error', event.error);
          };
          recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
          };
          try {
            recognition.start();
            recognitionRef.current = recognition;
          } catch (err) {
            console.warn('[coach/audio] unable to start recognition', err);
            recognitionRef.current = null;
            recognitionStarted = false;
          }
        } else {
          recognitionStarted = false;
        }
      }

      if (!sttSupported || recognitionStarted) {
        setIsListening(true);
        setInterimTranscript('');
        return true;
      }

      stopAnalyser();
      setIsListening(false);
      setInterimTranscript('');
      return false;
    } catch (error) {
      console.error('[coach/audio] microphone access denied', error);
      setPermission('denied');
      stopAnalyser();
      return false;
    }
  }, [analyseAmplitude, handleRecognitionResult, isListening, lang, micSupported, sttSupported, stopAnalyser]);

  const requestPermission = useCallback(async () => {
    if (!micSupported) {
      setPermission('denied');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
      return true;
    } catch (error) {
      console.warn('[coach/audio] permission request failed', error);
      setPermission('denied');
      return false;
    }
  }, [micSupported]);

  const resetTranscript = useCallback(() => {
    setCurrentTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => stopListening, [stopListening]);

  return {
    sttSupported,
    micSupported,
    permission,
    isListening,
    interimTranscript,
    currentTranscript,
    amplitude,
    requestPermission,
    startListening,
    stopListening,
    resetTranscript,
  };
}
