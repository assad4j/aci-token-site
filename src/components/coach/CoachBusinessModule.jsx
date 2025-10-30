import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AstronautHeroVideo from '../AstronautHeroVideo';

export default function CoachBusinessModule() {
  const sectionRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation();

  const ROLE_ACCENTS = {
    coach: 'text-emerald-300',
    user: 'text-amber-300',
  };

  const localizedMessages = t('coachBusinessModule.messages', { returnObjects: true }) ?? [];

  const messageSequence = useMemo(
    () =>
      localizedMessages.map(entry => ({
        role: entry.role ?? 'coach',
        label: entry.label ?? '',
        text: entry.text ?? '',
        accent: ROLE_ACCENTS[entry.role] ?? ROLE_ACCENTS.coach,
      })),
    [localizedMessages],
  );

  const moduleTitle = t('coachBusinessModule.title');
  const moduleDescription = t('coachBusinessModule.description');
  const scrollHint = t('coachBusinessModule.scrollHint');

  const fallbackSequence = useMemo(
    () => [
      {
        role: 'coach',
        label: 'Coach ACI',
        text: "Je viens d’analyser ton profil et ta façon de travailler : tu veux que je cible un business rentable ou que je renforce ta présence actuelle ?",
        accent: ROLE_ACCENTS.coach,
      },
      {
        role: 'user',
        label: 'Toi',
        text: 'Je veux un plan clair et un business qui correspond à mon énergie, sans perdre de temps.',
        accent: ROLE_ACCENTS.user,
      },
      {
        role: 'coach',
        label: 'Coach ACI',
        text: 'Je sélectionne trois idées alignées sur tes compétences, je réserve les rendez-vous nécessaires et j’active la conciergerie paiement et déplacement.',
        accent: ROLE_ACCENTS.coach,
      },
    ],
    [],
  );

  const resolvedMessages = messageSequence.length > 0 ? messageSequence : fallbackSequence;

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
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;
    let cancelled = false;
    if (step >= resolvedMessages.length) {
      setTypingRole(null);
      setPartial('');
      return undefined;
    }

    const currentMessage = resolvedMessages[step];
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
  }, [resolvedMessages, isActive, step]);

  return (
    <section
      ref={sectionRef}
      className="mt-16 grid gap-8 lg:grid-cols-[1fr_520px] lg:items-start"
    >
      <div className="space-y-4 text-white/80">
        <h2 className="text-2xl font-semibold text-white">{moduleTitle}</h2>
        <p className="leading-relaxed">{moduleDescription}</p>
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
      <div className="mx-auto w-full max-w-[520px] min-[320px]:max-w-[420px] sm:max-w-[480px]">
        <AstronautHeroVideo width={520} orientation="left" />
      </div>
    </section>
  );
}
