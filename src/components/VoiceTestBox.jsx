import React, { useCallback, useState } from 'react';
import { useSpeechFR } from '../hooks/useSpeechFR';

export default function VoiceTestBox({ onTranscript, onStart, onStop }) {
  const [history, setHistory] = useState([]);
  const handleTranscript = useCallback(
    text => {
      setHistory(prev => [{ id: Date.now(), text }, ...prev].slice(0, 4));
      onTranscript?.(text);
    },
    [onTranscript],
  );

  const { supported, isListening, start, stop, error, transcript } = useSpeechFR(handleTranscript);

  const handleToggle = useCallback(() => {
    if (isListening) {
      stop();
      onStop?.();
    } else {
      onStart?.();
      start();
    }
  }, [isListening, onStart, onStop, start, stop]);

  if (!supported) {
    return (
      <p className="text-xs text-amber-200/70">
        Micro vocal non supporté par ce navigateur. Essaie Chrome ou Edge en HTTPS.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/80">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold uppercase tracking-[0.26em] text-emerald-200/80">Test Micro</p>
        <button
          type="button"
          onClick={handleToggle}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition ${
            isListening ? 'bg-rose-500 text-black hover:bg-rose-400' : 'bg-emerald-500 text-black hover:bg-emerald-400'
          }`}
        >
          {isListening ? 'Stop' : 'Parler'}
        </button>
      </div>
      <div className="mt-3 space-y-1">
        {transcript && (
          <p className="text-[11px] text-white/70">
            Dernier texte détecté : <span className="text-white">“{transcript}”</span>
          </p>
        )}
        {error && <p className="text-[11px] text-rose-300">{error}</p>}
      </div>
      {history.length > 0 && (
        <ul className="mt-3 space-y-1 text-[11px] text-white/50">
          {history.map(item => (
            <li key={item.id} className="truncate">
              • {item.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
