import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_VIDEO_COPY, mergeVideoCopy } from '../astronautCopy';
import useIsMobile from '../../hooks/useIsMobile';

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
  const isMobile = useIsMobile(768);

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
  const rawVideoCopy = t('astronautVideo', { returnObjects: true });
  const videoCopy = useMemo(
    () => mergeVideoCopy(rawVideoCopy),
    [i18n.language, rawVideoCopy],
  );

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

  const shouldLoadInteractiveVideo = shouldRenderVideo && !isMobile;

  const videoBlock = (
    <div className="mx-auto w-full max-w-[520px] min-[320px]:max-w-[420px] sm:max-w-[480px]">
      {shouldLoadInteractiveVideo ? (
        <Suspense
          fallback={
            <StaticAstronautCard
              badgeLabel={videoCopy.badge || DEFAULT_VIDEO_COPY.badge}
              fallback={videoCopy.fallback || DEFAULT_VIDEO_COPY.fallback}
              focus={videoCopy.focus || DEFAULT_VIDEO_COPY.focus}
            />
          }
        >
          <AstronautHeroVideo width={520} orientation={astronautOrientation} />
        </Suspense>
      ) : (
        <StaticAstronautCard
          badgeLabel={videoCopy.badge || DEFAULT_VIDEO_COPY.badge}
          fallback={videoCopy.fallback || DEFAULT_VIDEO_COPY.fallback}
          focus={videoCopy.focus || DEFAULT_VIDEO_COPY.focus}
        />
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

function StaticAstronautCard({ badgeLabel, fallback, focus }) {
  const fallbackTitle = fallback?.title || DEFAULT_VIDEO_COPY.fallback.title;
  const fallbackDescription = fallback?.description || DEFAULT_VIDEO_COPY.fallback.description;
  const fallbackNote =
    fallback?.mobileNote || fallback?.note || DEFAULT_VIDEO_COPY.fallback.mobileNote || DEFAULT_VIDEO_COPY.fallback.note;
  const focusTitle = focus?.title || DEFAULT_VIDEO_COPY.focus.title;
  const focusTag = focus?.tag || DEFAULT_VIDEO_COPY.focus.tag;
  const focusItems =
    Array.isArray(focus?.items) && focus.items.length ? focus.items : DEFAULT_VIDEO_COPY.focus.items;

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

        <div className="pointer-events-none absolute left-6 top-6 z-20 flex items-center gap-3 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-emerald-100 shadow-[0_12px_30px_-18px_rgba(59,130,246,0.65)] backdrop-blur-md">
          <span className="h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,1)_0%,rgba(190,149,34,0.4)_60%,rgba(250,204,21,0)_100%)] shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
          {badgeLabel}
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/30 px-6 text-center text-sm text-white/75 backdrop-blur-[2px]">
          <span className="rounded-full border border-white/20 bg-black/60 px-4 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-200">
            {fallbackTitle}
          </span>
          <p className="max-w-[240px] leading-relaxed text-white/80">{fallbackDescription}</p>
          <p className="text-xs text-white/55">{fallbackNote}</p>
        </div>

        <div className="pointer-events-none absolute inset-x-6 bottom-6 z-20 rounded-2xl border border-emerald-200/15 bg-black/55 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-emerald-100/80">
            {focusTitle}
            <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-emerald-100">
              {focusTag}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/80">
            {focusItems.map((item, index) => {
              const title = item?.title || '';
              const value = item?.value || '';
              return (
                <div key={`${index}-${title}`}>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/70">{title}</p>
                  <p className="mt-1 font-semibold text-white">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
