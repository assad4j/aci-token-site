import React, { useEffect, useMemo, useRef, useState } from 'react';
import AstronautHeroVideo from '../AstronautHeroVideo';

export default function Coach3DModule() {
  const sectionRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const MESSAGE_SEQUENCE = useMemo(
    () => [
      {
        role: 'coach',
        label: 'Coach ACI',
        accent: 'text-emerald-300',
        text: 'Salut 👋 Je suis ton coach IA ACI. Prêt à stabiliser ton mindset ?',
      },
      {
        role: 'user',
        label: 'Toi',
        accent: 'text-amber-300',
        text: 'Impressionnant ! Comment vas-tu personnaliser ma routine ?',
      },
      {
        role: 'coach',
        label: 'Coach ACI',
        accent: 'text-emerald-300',
        text: 'Je détecte ton énergie, j’analyse ta voix et je te propose le prochain défi précis. La version interactive arrive très vite ✨',
      },
    ],
    [],
  );

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [partial, setPartial] = useState('');
  const [typingRole, setTypingRole] = useState(null);
  const currentUtteranceRef = useRef(null);
  const spokenStepRef = useRef(-1);
  const canSpeak = useMemo(
    () => typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined',
    [],
  );

  const speakText = useMemo(() => {
    if (!canSpeak) return () => {};
    return text => {
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        const preferred =
          voices.find(v => v.lang?.startsWith('fr') && v.name?.toLowerCase().includes('google')) ||
          voices.find(v => v.lang?.startsWith('fr')) ||
          voices[0];
        if (preferred) utterance.voice = preferred;
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        synth.speak(utterance);
        currentUtteranceRef.current = utterance;
      } catch (err) {
        console.warn('[coach-demo] speech failed', err);
      }
    };
  }, [canSpeak]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || hasStartedRef.current) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasStartedRef.current) {
            hasStartedRef.current = true;
            setIsActive(true);
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;
    let cancelled = false;
    if (step >= MESSAGE_SEQUENCE.length) {
      setTypingRole(null);
      setPartial('');
      return undefined;
    }

    const currentMessage = MESSAGE_SEQUENCE[step];
    const fullText = currentMessage.text;
    let index = 0;
    setTypingRole(currentMessage);

    if (currentMessage.role === 'coach' && canSpeak && spokenStepRef.current !== step) {
      spokenStepRef.current = step;
      const speakNow = () => speakText(fullText);
      const synth = window.speechSynthesis;
      if (synth.getVoices().length === 0) {
        const handler = () => {
          speakNow();
          synth.removeEventListener('voiceschanged', handler);
        };
        synth.addEventListener('voiceschanged', handler);
      } else {
        speakNow();
      }
    }

    const interval = setInterval(() => {
      if (cancelled) return;
      index += 1;
      setPartial(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        if (cancelled) return;
        setMessages(prev => [...prev, currentMessage]);
        setTypingRole(null);
        setTimeout(() => {
          if (cancelled) return;
          setPartial('');
          setStep(prev => prev + 1);
        }, 900);
      }
    }, 45);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (currentUtteranceRef.current && canSpeak) {
        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
      }
    };
  }, [MESSAGE_SEQUENCE, canSpeak, isActive, speakText, step]);

  return (
    <section ref={sectionRef} className="mt-16 grid gap-8 lg:grid-cols-[520px_1fr] lg:items-start">
      <AstronautHeroVideo width={520} />
      <div className="space-y-4 text-white/80">
        <h2 className="text-2xl font-semibold text-white">Coach IA (démo animée)</h2>
        <p className="leading-relaxed">
          Aperçu du Coach IA : l’astronaute échange un court dialogue automatique pour illustrer
          l’expérience à venir. La version interactive (voix, émotions, routines) sera bientôt
          disponible.
        </p>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white/80">
            <div className="flex flex-col gap-4">
              {messages.map(message => (
                <div key={`${message.role}-${message.text}`}>
                  <span className={`font-semibold ${message.accent}`}>{message.label}</span>
                <p className="mt-1 text-white/75">{message.text}</p>
              </div>
            ))}
            {typingRole && (
              <div>
                <span className={`font-semibold ${typingRole.accent}`}>{typingRole.label}</span>
                <p className="mt-1 text-white/70">
                  {partial}
                  <span className="ml-1 animate-pulse">▮</span>
                </p>
              </div>
            )}
            {!typingRole && messages.length === 0 && (
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                Faites défiler pour lancer la démo
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
