import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AstronautHeroVideo from '../AstronautHeroVideo';

export default function Coach3DModule({
  orientation = 'video-left',
  title,
  description,
  messageSequence,
}) {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [isActive, setIsActive] = useState(false);

  const localizedDefault = t('coach3DModule', { returnObjects: true }) ?? {};

  const roleAccents = {
    coach: 'text-emerald-300',
    user: 'text-amber-300',
  };

  const defaultSequence = useMemo(() => {
    const rawMessages = Array.isArray(localizedDefault.messages) ? localizedDefault.messages : [];
    const mapped = rawMessages.map(entry => ({
      role: entry.role ?? 'coach',
      label: entry.label ?? '',
      text: entry.text ?? '',
      accent: roleAccents[entry.role] ?? roleAccents.coach,
    }));
    if (mapped.length > 0) {
      return mapped;
    }
    return [
      {
        role: 'coach',
        label: 'Coach ACI',
        text: 'Salut, je suis ton coach IA ACI. On démarre ensemble pour stabiliser ton mindset ?',
        accent: roleAccents.coach,
      },
      {
        role: 'user',
        label: 'Toi',
        text: 'Impressionnant ! Comment vas-tu personnaliser ma routine ?',
        accent: roleAccents.user,
      },
      {
        role: 'coach',
        label: 'Coach ACI',
        text: 'Je détecte ton énergie, j’analyse ta voix et je choisis ton prochain défi précis. La version interactive arrive très vite, on se retrouve pour la suite.',
        accent: roleAccents.coach,
      },
    ];
  }, [localizedDefault.messages]);

  const resolvedSequence = useMemo(
    () => (Array.isArray(messageSequence) && messageSequence.length > 0 ? messageSequence : defaultSequence),
    [messageSequence, defaultSequence],
  );

  const resolvedTitle = title ?? localizedDefault.title ?? 'Coach IA (demo)';
  const resolvedDescription =
    description ??
    localizedDefault.description ??
    'Aperçu du Coach IA.';
  const scrollHint = localizedDefault.scrollHint ?? 'Faites défiler pour lancer la démo';
  const videoLeft = orientation !== 'video-right';

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [partial, setPartial] = useState('');
  const [typingRole, setTypingRole] = useState(null);

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
      <AstronautHeroVideo width={520} orientation={astronautOrientation} />
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
