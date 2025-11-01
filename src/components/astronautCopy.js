const DEFAULT_VIDEO_COPY = {
  loading: 'Chargement du coach…',
  badge: 'ACI Coach',
  fallback: {
    title: 'Mode statique',
    description:
      'WebGL n’est pas disponible sur cet appareil. Le coach 3D sera affiché sur un navigateur compatible (ordinateur ou mobile récent).',
    note: 'Aucun blocage : le reste de l’expérience fonctionne normalement.',
    mobileNote:
      'Version mobile optimisée : l’animation 3D est désactivée pour accélérer le chargement.',
  },
  focus: {
    title: 'Mode focus',
    tag: 'Concierge IA',
    items: [
      { title: 'Profil', value: 'Analyse comportementale prête' },
      { title: 'Business', value: '3 idées qualifiées' },
      { title: 'Conciergerie', value: 'Rendez-vous en cours' },
      { title: 'Mindset', value: 'Routine anti-stress activée' },
    ],
  },
};

function mergeInto(target, source) {
  if (!source || typeof source !== 'object') {
    return target;
  }
  Object.keys(source).forEach(key => {
    const value = source[key];
    if (Array.isArray(value)) {
      target[key] = value.map(item =>
        item && typeof item === 'object' ? mergeInto({}, item) : item,
      );
    } else if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeInto(target[key], value);
    } else if (value !== undefined) {
      target[key] = value;
    }
  });
  return target;
}

function mergeVideoCopy(overrides) {
  const base = JSON.parse(JSON.stringify(DEFAULT_VIDEO_COPY));
  if (overrides && typeof overrides === 'object') {
    mergeInto(base, overrides);
  }
  return base;
}

export { DEFAULT_VIDEO_COPY, mergeVideoCopy };
