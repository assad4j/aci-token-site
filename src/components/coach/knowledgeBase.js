const KNOWLEDGE_BASE = {
  fr: [
    {
      id: 'greetings',
      keywords: ['bonjour', 'salut', 'coucou', 'hey', 'hello', 'bonsoir'],
      reply:
        "Hey ! Ravi de te retrouver. On s’attaque à quoi aujourd’hui : staking, roadmap, mindset ou tu veux que je te propose une mini routine ?",
      mood: 'energetic',
      intention: 'supportive',
    },
    {
      id: 'identity',
      keywords: ['qui es-tu', 'tu es qui', 'coach ia', 'assistant', 'tu fais quoi'],
      reply:
        "Je suis l’IA propriétaire d’ACI SmartTrader Suite. J’écoute ta voix, je sens ton énergie et j’ajuste ton plan pour que tu progresse sans te griller. Bref, je suis ton coach perso dispo 24/7.",
      mood: 'neutral',
      intention: 'clarifying focus',
    },
    {
      id: 'ecosystem-overview',
      keywords: ['ecosysteme', 'éco', 'plateforme', 'aci', 'meta coach', 'fonctionnement', 'vision', 'mission'],
      reply:
        "Imagine l’écosystème ACI comme un circuit en trois temps : le token t’ouvre les portes, je t’accompagne en live et les parcours te font monter en puissance. À chaque progression, je te débloque des modules adaptés et ton dashboard s’actualise avec l’XP, les rewards et les prochaines actions.",
      mood: 'energetic',
      intention: 'clarifying focus',
    },
    {
      id: 'training-engine',
      keywords: ['plan', 'entraînement', 'entrainement', 'routine', 'performance', 'analyse', 'progression', 'coach'],
      reply:
        "Je scrute ton stress, ta confiance et ton rythme. Si je sens que tu forces, je te glisse une respiration guidée ; si tu es dans le flow, je te propose un module plus costaud. Mon but : piloter ton entraînement en live, exactement comme un coach humain.",
      mood: 'energetic',
      intention: 'motivating',
    },
    {
      id: 'training-catalog',
      keywords: ['formation', 'formations', 'programme', 'programmes', 'cours', 'module', 'modules', 'apprentissage', 'education', 'training'],
      reply:
        "Nos formations sont classées par niveaux : fondamentaux du trading, stratégies avancées, psychologie et routines émotionnelles. Dis-moi où tu en es, je t’indique la prochaine étape et je peux même ajouter la session à ton plan du jour.",
      mood: 'supportive',
      intention: 'clarifying focus',
    },
    {
      id: 'presale-overview',
      keywords: ['prévente', 'presale', 'acheter', 'token', 'allocation', 'vente'],
      reply:
        "Pour participer à la prévente, tu connectes ton wallet, tu choisis la tranche encore dispo et je t’envoie une alerte si le palier se remplit trop vite. Une fois validé, ton allocation apparaît dans ton dashboard et je te tiens informé du calendrier de distribution.",
      mood: 'neutral',
      intention: 'supportive',
    },
    {
      id: 'staking-utility',
      keywords: ['staking', 'staker', 'apy', 'rewards', 'rendement', 'lock', 'verrouillage'],
      reply:
        "Quand tu stakes ton ACI, tu touches des rewards mais tu débloques aussi des modules premium, des remises et des priorités sur les ventes. Je garde ton solde à l’œil et je te préviens dès qu’il faut réclamer ou ajuster ta position.",
      mood: 'neutral',
      intention: 'motivating',
    },
    {
      id: 'tiers-benefits',
      keywords: ['tiers', 'paliers', 'avantages', 'levels', 'packs', 'badge'],
      reply:
        "Les tiers ACI, c’est comme des badges de progression : plus tu montes, plus tu débloques des analyses pointues, des lives privés et même des sessions avec les coachs humains. Dis-moi ton objectif et je te guiderai vers le palier le plus utile.",
      mood: 'energetic',
      intention: 'supportive',
    },
    {
      id: 'marketplace',
      keywords: ['marketplace', 'modules', 'formations', 'récompenses', 'recompenses', 'missions'],
      reply:
        "La marketplace, c’est notre terrain de jeu : routines IA, masterclass, outils… Tu peux payer en ACI (avec une réduction selon ton tier) ou avec les rewards gagnés. Chaque achat me donne des infos pour ajuster ton plan derrière le rideau.",
      mood: 'energetic',
      intention: 'clarifying focus',
    },
    {
      id: 'tokenomics',
      keywords: ['tokenomics', 'allocation', 'distribution', 'supply', 'offre', 'répartition'],
      reply:
        "Côté tokenomics, on ventile le supply pour financer l’IA, récompenser les stakers et garder de la liquidité. Plus tu joues le jeu (staking, missions), plus tu gagnes de l’influence et tu vois ce qui arrive pour la gouvernance.",
      mood: 'neutral',
      intention: 'clarifying focus',
    },
    {
      id: 'roadmap',
      keywords: ['roadmap', 'feuille de route', 'prochaines étapes', 'plan futur'],
      reply:
        "La roadmap avance en trois temps : Alpha pour lancer le coach voix et le staking pilote, Beta pour ouvrir la marketplace et sortir l’app mobile, puis Growth pour basculer en DAO, signer des partenariats pro et ouvrir nos API. Je te ping dès qu’une étape te concerne directement.",
      mood: 'energetic',
      intention: 'motivating',
    },
    {
      id: 'governance-roadmap',
      keywords: ['gouvernance', 'vote', 'roadmap', 'avenir', 'future', 'future'],
      reply:
        "L’ACI ouvrira la gouvernance communautaire : votes sur les nouveaux modules, choix des partenaires et allocation du fonds communautaire. Les jalons : prévente, plateforme d’entraînement, marketplace, puis DAO. Je te tiendrai au courant des votes où ton staking compte.",
      mood: 'neutral',
      intention: 'motivating',
    },
    {
      id: 'emotion-trading-stress',
      keywords: ['stress', 'peur', 'angoisse', 'émotion', 'émotions', 'perdre', 'perte', 'panic'],
      reply:
        "Ok respire avec moi : inspire 4 temps, garde l’air 2, expire 6. Note la situation exacte qui déclenche la tension et une action que tu contrôles pour la prochaine session. On pilote ton plan, pas tes peurs. Je reste là pour recalibrer ta routine.",
      mood: 'calm',
      intention: 'soothing',
    },
    {
      id: 'emotion-trading-confidence',
      keywords: ['doute', 'confiance', 'motivation', 'objectif', 'discipline', 'blocage'],
      reply:
        "Je suis ton meilleur allié : rappelle-toi ta dernière exécution propre, liste ce qui a marché et visualise la prochaine étape. Je t’envoie un défi court ou un module mindset pour relancer la dynamique. Ensemble on garde ton intention alignée.",
      mood: 'energetic',
      intention: 'motivating',
    },
    {
      id: 'support-contact',
      keywords: ['support', 'contact', 'aide', 'problème', 'issue', 'bug', 'question'],
      reply:
        "Besoin d’un humain ? support@aci-token.net ou le chat officiel sont là. Dis-moi aussi ce qui bloque : je logge l’info pour la team et je te propose un contournement en attendant.",
      mood: 'neutral',
      intention: 'supportive',
    },
  ],
  en: [
    {
      id: 'greetings',
      keywords: ['hello', 'hi', 'hey', 'yo', 'what’s up', 'bonjour', 'salut'],
      reply:
        "Hey there! I’m glad you’re here. Fancy a chat about staking, roadmap, mindset drills, or should I spin up a quick routine for you?",
      mood: 'energetic',
      intention: 'supportive',
    },
    {
      id: 'identity',
      keywords: ['who are you', 'what are you', 'coach ai', 'assistant', 'what do you do'],
      reply:
        "I’m the proprietary ACI SmartTrader Suite AI. I listen to your voice, catch the emotional cues, and tweak your plan so you grow without burning out. Basically, I’m your on-call training partner.",
      mood: 'neutral',
      intention: 'clarifying focus',
    },
    {
      id: 'ecosystem-overview',
      keywords: ['ecosystem', 'platform', 'aci', 'meta coach', 'how it works', 'vision', 'mission'],
      reply:
        "Picture the ACI ecosystem as a three-part loop: the token opens the door, I stay by your side in real time, and the training tracks push you forward. Every time you level up I unlock new modules and your dashboard refreshes with XP, rewards and next moves.",
      mood: 'energetic',
      intention: 'clarifying focus',
    },
    {
      id: 'training-engine',
      keywords: ['training', 'plan', 'routine', 'performance', 'analysis', 'progress', 'coach'],
      reply:
        "I keep tabs on your stress, confidence and tempo. If you’re pushing too hard I’ll slide in a breathing drill; if you’re in the zone I’ll surface a tougher module. Think of me as the coach who adjusts the plan while you’re in motion.",
      mood: 'energetic',
      intention: 'motivating',
    },
    {
      id: 'training-catalog',
      keywords: ['training', 'course', 'courses', 'formation', 'program', 'programs', 'module', 'modules', 'curriculum', 'lessons'],
      reply:
        "The training catalogue is layered: trading fundamentals, advanced strategies, mindset drills, emotional routines. Tell me your current level and I’ll pull the next module—or drop it straight into your schedule for today.",
      mood: 'supportive',
      intention: 'clarifying focus',
    },
    {
      id: 'presale-overview',
      keywords: ['presale', 'pre-sale', 'buy', 'token', 'allocation', 'sale'],
      reply:
        "For the presale, just connect your wallet, pick the live tier and I’ll nudge you if the tranche is filling up. Once it’s locked, your allocation pops up on the dashboard and I keep you posted on the distribution timeline.",
      mood: 'neutral',
      intention: 'supportive',
    },
    {
      id: 'staking-utility',
      keywords: ['staking', 'stake', 'rewards', 'apy', 'yield', 'lock', 'locked'],
      reply:
        "When you stake ACI you earn rewards, sure, but you also unlock premium modules, discounts and early access on drops. I keep an eye on your balance and ping you when it’s time to claim or rebalance.",
      mood: 'neutral',
      intention: 'motivating',
    },
    {
      id: 'tiers-benefits',
      keywords: ['tiers', 'levels', 'benefits', 'packs', 'badges'],
      reply:
        "ACI tiers work like progression badges: the higher you go, the more advanced analytics, private live rooms and human mentor sessions you unlock. Tell me what you’re chasing and I’ll point you to the tier that fits.",
      mood: 'energetic',
      intention: 'supportive',
    },
    {
      id: 'marketplace',
      keywords: ['marketplace', 'modules', 'courses', 'rewards', 'missions', 'store'],
      reply:
        "The marketplace is our playground: AI routines, masterclasses, pro tools. Pay in ACI (tier discounts apply) or with the rewards you’ve earned. Each purchase gives me new signals to fine-tune your plan.",
      mood: 'energetic',
      intention: 'clarifying focus',
    },
    {
      id: 'tokenomics',
      keywords: ['tokenomics', 'allocation', 'distribution', 'supply'],
      reply:
        "Tokenomics-wise, ACI funds the coach, rewards the community and keeps liquidity healthy. Presale, R&D treasury, staking rewards — the more you engage, the more benefits and governance visibility you earn.",
      mood: 'neutral',
      intention: 'clarifying focus',
    },
    {
      id: 'roadmap',
      keywords: ['roadmap', 'next steps', 'milestones', 'plan'],
      reply:
        "Our roadmap moves in three beats: Alpha to launch the voice coach and staking pilot, Beta to open the marketplace and ship the mobile app, then Growth for DAO rollout, pro partnerships and community APIs. I’ll ping you when a milestone touches your plan.",
      mood: 'energetic',
      intention: 'motivating',
    },
    {
      id: 'governance-roadmap',
      keywords: ['governance', 'vote', 'roadmap', 'future', 'dao'],
      reply:
        "ACI will unlock community governance: token holders vote on new modules, partners and treasury allocation. Milestones: presale, training platform, marketplace, then DAO roll-out. I’ll notify you whenever a vote needs your staking power.",
      mood: 'neutral',
      intention: 'motivating',
    },
    {
      id: 'emotion-trading-stress',
      keywords: ['stress', 'fear', 'panic', 'emotion', 'loss', 'losing', 'anxiety'],
      reply:
        "Alright friend, breathe with me: inhale 4, hold 2, exhale 6. Capture the specific trigger and one action you control next time. We stick to the plan, not the panic. I’ll keep tailoring your routine to rebuild calm.",
      mood: 'calm',
      intention: 'soothing',
    },
    {
      id: 'emotion-trading-confidence',
      keywords: ['doubt', 'confidence', 'motivation', 'focus', 'discipline', 'block'],
      reply:
        "I’m at your side: recall your last clean execution, list what worked, and anchor your next step on that. I’ll drop a short mindset drill or module to reignite the momentum. We stay aligned with your intention.",
      mood: 'energetic',
      intention: 'motivating',
    },
    {
      id: 'support-contact',
      keywords: ['support', 'contact', 'help', 'issue', 'problem', 'bug', 'question'],
      reply:
        "Need a human touch? Ping support@aci-token.net or the official chat. Tell me here as well: I’ll log it for the team and suggest a workaround meanwhile.",
      mood: 'neutral',
      intention: 'supportive',
    },
  ],
};

const NORMALIZE_REGEX = /[\u0300-\u036f]/g;

const normalize = value =>
  value
    .normalize('NFD')
    .replace(NORMALIZE_REGEX, '')
    .toLowerCase();

export default function getKnowledgeAnswer({ text, lang }) {
  if (!text) return null;
  const base = KNOWLEDGE_BASE[lang] || KNOWLEDGE_BASE.en;
  const normalizedText = normalize(text);

  const entry = base.find(item =>
    item.keywords.some(keyword => normalizedText.includes(normalize(keyword)))
  );

  if (!entry) return null;

  return {
    reply: entry.reply,
    mood: entry.mood,
    intention: entry.intention,
  };
}
