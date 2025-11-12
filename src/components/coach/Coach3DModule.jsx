import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HologramAvatar from '../HologramAvatar';

export default function Coach3DModule({
  orientation = 'video-left',
  title,
  description,
  messageSequence,
}) {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const futuristicFont = '"Space Grotesk","Orbitron","Inter",sans-serif';

  const localizedDefault = useMemo(
    () => t('coach3DModule', { returnObjects: true }) ?? {},
    [t, i18n.language],
  );
  const fallbackContent = useMemo(
    () => t('coach3DModuleFallback', { returnObjects: true }) ?? {},
    [t, i18n.language],
  );

  const roleAccents = {
    coach: 'text-emerald-300',
    user: 'text-amber-300',
  };

  const defaultSequence = useMemo(() => {
    const rawMessages =
      Array.isArray(localizedDefault.messages) && localizedDefault.messages.length
        ? localizedDefault.messages
        : Array.isArray(fallbackContent.messages)
          ? fallbackContent.messages
          : [];
    return rawMessages.map(entry => ({
      role: entry.role ?? 'coach',
      label: entry.label ?? '',
      text: entry.text ?? '',
      accent: roleAccents[entry.role] ?? roleAccents.coach,
    }));
  }, [fallbackContent, localizedDefault.messages, i18n.language]);

  const resolvedSequence = useMemo(
    () => (Array.isArray(messageSequence) && messageSequence.length > 0 ? messageSequence : defaultSequence),
    [messageSequence, defaultSequence, i18n.language],
  );

  const resolvedTitle =
    title ?? localizedDefault.title ?? fallbackContent.title ?? 'ACI SmartRisk';
  const resolvedDescription =
    description ??
    localizedDefault.description ??
    fallbackContent.description ??
    'Mode SmartRisk : aperçu de l’IA qui calcule automatiquement la taille de position, bloque les dépassements et envoie des rapports Safe Academy.';
  const scrollHint =
    localizedDefault.scrollHint ?? fallbackContent.scrollHint ?? 'Fais défiler pour lancer SmartRisk';
  const videoLeft = orientation !== 'video-right';

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
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;
    let cancelled = false;
    if (step >= resolvedSequence.length) {
      setTypingRole(null);
      setPartial('');
      return undefined;
    }

    const currentMessage = resolvedSequence[step];
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
  }, [resolvedSequence, isActive, step]);

  const textBlock = (
    <div className="space-y-5 text-white/85">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
        IA • SmartRisk
      </div>
      <h2 className="text-3xl font-semibold text-white drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
        {resolvedTitle}
      </h2>
      <p className="leading-relaxed text-white/70">{resolvedDescription}</p>

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
  );

  const holoBlock = (
    <HologramAvatar
      variant="risk"
      title="ACI SmartRisk"
      subtitle="Sizing automatique • Blocage des dérives • Safe Academy"
      className="mx-auto w-full max-w-[420px]"
    />
  );

  return (
    <section
      ref={sectionRef}
      className="relative mt-16 overflow-hidden rounded-[40px] border border-sky-400/20 bg-gradient-to-br from-[#020d18] via-[#030b20] to-[#011425] p-8 text-white shadow-[0_40px_120px_-60px_rgba(56,189,248,0.9)]"
      style={{ fontFamily: futuristicFont }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#38bdf8,transparent_60%)] opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,transparent_2px,transparent_120px)] opacity-20 animate-[smartScan_8s_linear_infinite]" />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        {videoLeft ? (
          <>
            {textBlock}
            {holoBlock}
          </>
        ) : (
          <>
            {holoBlock}
            {textBlock}
          </>
        )}
      </div>

      <style>{`
        @keyframes smartScan {
          0% { transform: translateY(0); }
          100% { transform: translateY(-120px); }
        }
      `}</style>
    </section>
  );
}
