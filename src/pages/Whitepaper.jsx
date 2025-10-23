import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const SECTION_DATA = [
  {
    id: 'executive-summary',
    title: '0. Résumé exécutif',
    content: [
      "ACI Meta Coach est un assistant 3D intelligent qui accompagne chaque investisseur comme un coach personnel. Il écoute la voix, comprend l’état émotionnel, adapte les parcours d’apprentissage et récompense la discipline via le token ACI."
    ],
  },
  {
    id: 'vision',
    title: '1. Vision & problématique',
    content: [
      "Les traders particuliers sont submergés d’informations tout en restant seuls face au stress. Les plateformes actuelles sont passives et déconnectées des émotions. Notre ambition est de proposer " +
        "un entraîneur sportif des marchés: un coach IA 3D, empathique, qui synchronise formation, staking et gouvernance.",
      "Objectifs 24 mois : -30 % de stress perçu, +40 % de complétion des parcours, 75 % du supply en staking un an après la prévente, 3 votes de gouvernance la première année."
    ],
  },
  {
    id: 'ecosystem',
    title: '2. Écosystème ACI',
    content: [
      "Token ACI : carburant économique, outil de gouvernance et levier de gamification. Il aligne utilisateurs, coachs et partenaires et finance l’amélioration continue de l’IA.",
      "Coach IA 3D : avatar animé, personnalité \"meilleur ami\", analyse voix/caméra, knowledge base, fallback local.",
      "Parcours Meta Coach : tracks trading, mindset, gestion du risque, routines journalières et journaling.",
      "Marketplace : modules IA, masterclass, packs coach humains, outils premium. Paiement en ACI ou stablecoins avec conversion."
    ],
  },
  {
    id: 'architecture',
    title: '3. Architecture technique',
    content: [
      "Frontend : React 18, Tailwind, Three.js, fallback offline, sécurité CSP/SRI.",
      "Backend IA : modèle propriétaire ACI entraîné sur nos contenus de formation et modules comportementaux, avec knowledge index, pipeline vocal (STT/TTS) et monitoring fiabilité/sécurité.",
      "Smart contracts : prévente, staking, scripts Hardhat/Foundry, audits indépendants, multi-signature.",
      "Observabilité : logs anonymisés, Prometheus/Grafana, Sentry, alertes latence IA." 
    ],
  },
  {
    id: 'coach-ai',
    title: '4. Coach IA — fonctionnement',
    content: [
      "Pipeline : voix → STT → features émotionnelles → contextualisation plan → réponse + nudge.",
      "Persona : tutoiement, humour léger, modes \"Best Friend\" / \"Tactical Coach\".",
      "Analyse voix & caméra : RMS, variance, pitch, fillers/minute, baseline adaptative, caméra Human.js optionnelle.",
      "Fallback : knowledge base locale même sans backend externe pour garantir une réponse."
    ],
  },
  {
    id: 'training',
    title: '5. Parcours & marketplace',
    content: [
      "Construction du plan : diagnostic, onboarding, cycle hebdomadaire, review émotionnelle.",
      "Marketplace : routines IA, masterclass traders, packs coach humains, outils — revenue share créateurs.",
      "KPIs : sessions voix/semaine, Net Emotional Score, progression plan, TVL staking, MRR marketplace."
    ],
  },
  {
    id: 'tokenomics',
    title: '6. Tokenomics',
    content: [
      "Allocation indicative : 35 % prévente, 20 % team/advisors, 15 % trésor R&D, 20 % rewards staking/missions, 10 % liquidité/ops.",
      "Staking : APR modulable (10-25 %), lock 30-180 jours, bonus tiers, rewards (tokens, modules premium, XP plan).",
      "Utilité ACI : accès premium, réductions marketplace, gouvernance, priorités presales, récompenses missions."
    ],
  },
  {
    id: 'roadmap',
    title: '7. Roadmap',
    content: [
      "Alpha (0-6 mois) : prévente, coach IA voix + KB, staking pilote, marketplace MVP, tests émotion.",
      "Beta (6-12 mois) : coach IA v2, marketplace ouverte, app mobile, sessions hybrides, votes de signalisation.",
      "Growth (12-24 mois) : DAO complète, API plan IA, white-label coach, extension DeFi, programmes buy-back, expansion internationale."
    ],
  },
  {
    id: 'governance',
    title: '8. Gouvernance & communauté',
    content: [
      "DAO progressive (staking-weighted voting, delegation).",
      "Conseil communautaire (utilisateurs, créateurs, mentors).",
      "Rapports trimestriels, programmes ambassadeurs, AMA, hackathons."
    ],
  },
  {
    id: 'security',
    title: '9. Sécurité & conformité',
    content: [
      "Audits indépendants, multisig Gnosis Safe.",
      "RGPD : consentement explicite voix/cam, stockage local par défaut.",
      "Limitation IA : rate limit, modération, red teaming.",
      "Bug bounty via Immunefi/HackerOne."
    ],
  },
  {
    id: 'metrics',
    title: '10. Indicateurs clés',
    content: [
      "Voice engagement, variation stress/confidence, TVL staking, revenus marketplace, participation gouvernance, support client, taux fallback IA."
    ],
  },
  {
    id: 'risks',
    title: '11. Risques & mitigation',
    content: [
      "Dépendance IA → fallback local, multi-prestataires.",
      "Volatilité token → diversification trésor, pricing adaptatif.",
      "Régulation voix → mode texte-only, consentement renforcé.",
      "Adoption → programmes ambassadeurs, partenariats.",
      "Coût IA → optimisation prompts, caching, monitoring.",
      "RGPD/data → anonymisation, stockage local par défaut."
    ],
  },
  {
    id: 'conclusion',
    title: '12. Conclusion',
    content: [
      "ACI Meta Coach fusionne intelligence émotionnelle, tokenomics et coaching interactif pour aider les traders à rester disciplinés et engagés."
    ],
  },
];

export default function WhitepaperPage() {
  const sections = useMemo(() => SECTION_DATA, []);

  return (
    <div className="py-16 text-white">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">ACI Meta Coach — Whitepaper</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
          Découvrez l’architecture complète de la plateforme ACI, le rôle du token et la feuille de route pour construire un coach 3D émotionnellement intelligent.
        </p>
        <div className="flex justify-center gap-4 text-sm text-white/60">
          <a
            className="rounded-full border border-white/20 px-5 py-2 transition hover:border-emerald-400/80 hover:text-emerald-200"
            href="/WHITEPAPER.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger la version markdown
          </a>
          <Link
            className="rounded-full bg-[#10b981] px-5 py-2 font-semibold text-black transition hover:bg-[#00fff7]"
            to="/contact"
          >
            Contacter l’équipe
          </Link>
        </div>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-[260px_1fr]">
        <nav className="sticky top-24 hidden h-max flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur lg:flex">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Sommaire</span>
          <ul className="mt-3 space-y-2">
            {sections.map(section => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-emerald-200"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="space-y-12">
          {sections.map(section => (
            <section key={section.id} id={section.id} className="scroll-mt-28 space-y-4">
              <header className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-200">{section.title}</h2>
                <div className="h-1 w-16 rounded-full bg-emerald-400/50" />
              </header>
              <div className="space-y-4 text-base leading-relaxed text-white/75">
                {section.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
