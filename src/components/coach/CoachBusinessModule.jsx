import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HologramAvatar from '../HologramAvatar';

const DEFAULT_MESSAGES = [
  {
    role: 'coach',
    label: 'Coach ACI',
    text: "Je viens d’analyser ton historique de trades : tu veux que je t’aide à détecter les setups les plus rentables ou à améliorer ta discipline de trading ?",
  },
  {
    role: 'user',
    label: 'Toi',
    text: 'Je veux renforcer ma rigueur et améliorer mon taux de réussite.',
  },
  {
    role: 'coach',
    label: 'Coach ACI',
    text: 'Très bien. Je synchronise ton plan d’action et je te rappellerai les routines nécessaires avant chaque session.',
  },
];

const ROLE_ACCENTS = {
  coach: 'text-cyan-300',
  user: 'text-emerald-300',
};

export default function CoachBusinessModule() {
  const sectionRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const { t, i18n } = useTranslation();
  const futuristicFont = '"Space Grotesk","Orbitron","Inter",sans-serif';

  const localizedMessages = useMemo(() => {
    const value = t('coachBusinessModule.messages', { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t, i18n.language]);

  const messageSequence = useMemo(() => {
    const source = localizedMessages.length ? localizedMessages : DEFAULT_MESSAGES;
    return source.map(entry => {
      const role = entry.role ?? 'coach';
      return {
        role,
        label: entry.label ?? (role === 'coach' ? 'Coach ACI' : 'Toi'),
        text: entry.text ?? '',
        accent: ROLE_ACCENTS[role] ?? ROLE_ACCENTS.coach,
      };
    });
  }, [localizedMessages]);

  const moduleTitle = t('coachBusinessModule.title', {
    defaultValue: 'Coach IA Trader Pro',
  });
  const moduleDescription = t('coachBusinessModule.description', {
    defaultValue:
      "Version Trader Pro : l’IA analyse ton profil, détecte les opportunités à fort rendement et synchronise automatiquement plans d’action, rappels et discipline de trading.",
  });
  const scrollHint = t('coachBusinessModule.scrollHint', {
    defaultValue: 'Scroll pour lancer la simulation IA',
  });

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [partial, setPartial] = useState('');
  const [typingRole, setTypingRole] = useState(null);

  useEffect(() => {
    setMessages([]);
    setStep(0);
    setPartial('');
    setTypingRole(null);
    hasStartedRef.current = false;
    setIsActive(false);

    const element = sectionRef.current;
    if (element) {
      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          hasStartedRef.current = true;
          setIsActive(true);
        }
      });
    }
  }, [i18n.language]);

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
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;
    let cancelled = false;
    if (step >= messageSequence.length) {
      setTypingRole(null);
      setPartial('');
      return undefined;
    }

    const currentMessage = messageSequence[step];
    const fullText = currentMessage.text;
    let index = 0;
    setTypingRole(currentMessage);

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
    };
  }, [messageSequence, isActive, step]);

  return (
    <section
      ref={sectionRef}
      className="relative mt-16 overflow-hidden rounded-[40px] border border-cyan-500/20 bg-gradient-to-br from-[#030b1f] via-[#040817] to-[#021325] p-8 text-white shadow-[0_50px_120px_-60px_rgba(16,185,129,0.8)]"
      style={{ fontFamily: futuristicFont }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1dd3b0,transparent_55%),radial-gradient(circle_at_bottom,#1e40af,transparent_45%)] opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)] mix-blend-screen opacity-30 animate-[pulseLight_7s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0px,transparent_2px,transparent_120px)] opacity-20 animate-[scanLine_9s_linear_infinite]" />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-5 text-white/85">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            IA • Trader Pro
          </div>
          <h2 className="text-3xl font-semibold text-white drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
            {moduleTitle}
          </h2>
          <p className="leading-relaxed text-white/70">{moduleDescription}</p>

          <div className="rounded-[28px] border border-cyan-500/30 bg-white/5 p-5 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.9)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
              <span>Flux IA</span>
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                Online
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {messages.map(message => (
                <div key={`${message.role}-${message.text}`} className="rounded-2xl bg-black/30 p-4 shadow-inner shadow-black/30">
                  <span className={`text-xs uppercase tracking-[0.3em] ${message.accent}`}>
                    {message.label}
                  </span>
                  <p className="mt-2 text-base leading-relaxed text-white/80">{message.text}</p>
                </div>
              ))}
              {typingRole && (
                <div className="rounded-2xl bg-black/30 p-4 shadow-inner shadow-black/30">
                  <span className={`text-xs uppercase tracking-[0.3em] ${typingRole.accent}`}>
                    {typingRole.label}
                  </span>
                  <p className="mt-2 text-base leading-relaxed text-white/80">
                    {partial}
                    <span className="ml-1 animate-pulse text-cyan-300">▮</span>
                  </p>
                </div>
              )}
              {!typingRole && messages.length === 0 && (
                <p className="text-xs uppercase tracking-[0.4em] text-white/35">{scrollHint}</p>
              )}
            </div>
          </div>
        </div>

        <HologramAvatar
          variant="trader"
          title="Coach IA Trader Pro"
          subtitle="Analyse des setups • Optimisation des entrées • Rituels discipline"
          className="mx-auto w-full max-w-[420px]"
        />
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateX(0); }
          100% { transform: translateX(-120px); }
        }
        @keyframes pulseLight {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
