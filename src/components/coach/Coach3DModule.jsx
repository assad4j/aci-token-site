import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AstronautHeroVideo = lazy(() => import('../AstronautHeroVideo'));

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
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

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

  const resolvedTitle = title ?? localizedDefault.title ?? fallbackContent.title ?? 'Coach IA (démo animée)';
  const resolvedDescription =
    description ??
    localizedDefault.description ??
    fallbackContent.description ??
    'Aperçu du Coach IA : l’astronaute échange un court dialogue automatique pour illustrer l’expérience à venir. La version interactive (voix, émotions, routines) sera bientôt disponible.';
  const scrollHint = localizedDefault.scrollHint ?? fallbackContent.scrollHint ?? 'Faites défiler pour lancer la démo';
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
    setShouldRenderVideo(false);

    const element = sectionRef.current;
    if (element) {
      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          hasStartedRef.current = true;
          setIsActive(true);
          setShouldRenderVideo(true);
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
          if (entry.isIntersecting) {
            setShouldRenderVideo(true);
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
    <div className="space-y-4 text-white/80">
      <h2 className="text-2xl font-semibold text-white">{resolvedTitle}</h2>
      <p className="leading-relaxed">{resolvedDescription}</p>
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
              {scrollHint}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const astronautOrientation = videoLeft ? 'right' : 'left';

  const videoBlock = (
    <div className="mx-auto w-full max-w-[520px] min-[320px]:max-w-[420px] sm:max-w-[480px]">
      {shouldRenderVideo ? (
        <Suspense fallback={<VideoPlaceholder />}>
          <AstronautHeroVideo width={520} orientation={astronautOrientation} />
        </Suspense>
      ) : (
        <VideoPlaceholder />
      )}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className={`mt-16 grid gap-8 lg:items-start ${videoLeft ? 'lg:grid-cols-[520px_1fr]' : 'lg:grid-cols-[1fr_520px]'}`}
    >
      {videoLeft ? (
        <>
          {videoBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {videoBlock}
        </>
      )}
    </section>
  );
}

function VideoPlaceholder() {
  return (
    <div
      className="relative w-full"
      style={{ maxWidth: '520px', minWidth: 'min(280px, 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0 -z-20 rounded-[28px] bg-gradient-to-br from-[#52ffe6]/20 via-transparent to-[#fcd34d]/25 blur-[38px]" />
      <div className="pointer-events-none absolute inset-[6%] -z-30 rounded-[48px] border border-white/5" />
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] border border-emerald-200/35 bg-[radial-gradient(65%_60%_at_50%_15%,rgba(255,220,128,0.22),rgba(6,10,18,0.9))] shadow-[0_25px_70px_-28px_rgba(16,185,129,0.65)]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.08)_70%)] opacity-50 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(45%_45%_at_50%_20%,rgba(250,204,21,0.25),rgba(15,23,42,0))]" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/35 px-6 text-center text-sm text-white/75 backdrop-blur">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/30 bg-black/60">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
          </div>
          <p className="max-w-[240px] text-sm text-white/80">
            Chargement de la démo 3D…
          </p>
          <p className="text-xs text-white/55">
            Initialisation du coach interactif
          </p>
        </div>
      </div>
    </div>
  );
}
