import React from 'react';

const VARIANTS = {
  trader: {
    accent: '#10b981',
    glow: '#37f7ff',
    background: '#031226',
    label: 'Coach IA Trader Pro',
  },
  emotion: {
    accent: '#5eead4',
    glow: '#8bfff9',
    background: '#04102a',
    label: 'ACI EmotionScan',
  },
  risk: {
    accent: '#38bdf8',
    glow: '#70d7ff',
    background: '#030b1f',
    label: 'ACI SmartRisk',
  },
};

/**
 * Futuristic hologram avatar used across the Coach IA modules.
 * Purely visual – no external assets – to keep the site lightweight.
 */
export default function HologramAvatar({
  variant = 'trader',
  title,
  subtitle = 'Analyse en direct • Discipline automatique',
  orientation = 'right',
  className = '',
}) {
  const palette = VARIANTS[variant] ?? VARIANTS.trader;
  const fontFamily = '"Space Grotesk","Orbitron","Inter",sans-serif';

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-[#030b20]/95 px-8 py-10 shadow-[0_30px_90px_-35px_rgba(55,247,255,0.8)] ${className}`}
      style={{ fontFamily }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${palette.glow}1a, transparent 55%), radial-gradient(circle at 80% 70%, ${palette.accent}26, transparent 60%)`,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, transparent 2px, transparent 120px)',
          animation: 'holoScan 7s linear infinite',
        }}
      />

      <div
        className={`pointer-events-none absolute ${orientation === 'right' ? 'left-4' : 'right-4'} top-6 h-[120%] w-[60%] rotate-12 bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-20`}
      />

      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <p
          className="text-xs uppercase tracking-[0.4em] text-white/60"
          style={{ letterSpacing: '0.4em' }}
        >
          ACI SMARTTRADER SUITE
        </p>
        <h3
          className="mt-4 text-3xl font-semibold text-white drop-shadow-[0_0_25px_rgba(55,247,255,0.65)]"
          style={{ color: palette.accent }}
        >
          {title || palette.label}
        </h3>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>

        <div className="mt-8 flex items-center justify-center">
          <div className="relative h-48 w-48 rounded-full border border-white/20 bg-[#040c1a]">
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: `radial-gradient(circle, ${palette.glow}55, transparent 65%)` }}
            />
            <div
              className="absolute inset-[14%] rounded-full border border-white/10 bg-black/50 backdrop-blur-sm"
              style={{ boxShadow: `0 0 40px ${palette.glow}44 inset` }}
            />
            <div
              className="absolute inset-[30%] rounded-full border border-white/20"
              style={{ borderColor: `${palette.accent}55` }}
            />
            <div
              className="absolute inset-[40%] rounded-full"
              style={{
                background: `radial-gradient(circle, ${palette.accent}ff, transparent 70%)`,
                filter: 'blur(8px)',
                animation: 'pulseCore 3.8s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/60">
          Neural Scan • Live Metrics • IA Discipline
        </p>
      </div>

      <ParticleField palette={palette} />

      <style>{`
        @keyframes holoScan {
          0% { transform: translateX(0); }
          100% { transform: translateX(-120px); }
        }
        @keyframes pulseCore {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0); opacity: 0.4; }
          50% { opacity: 0.9; }
          100% { transform: translateY(-22px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function ParticleField({ palette }) {
  const particles = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    top: `${8 + Math.random() * 80}%`,
    left: `${8 + Math.random() * 80}%`,
    size: `${4 + Math.random() * 6}px`,
    delay: `${Math.random() * 4}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map(particle => (
        <span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            background: palette.glow,
            opacity: 0.35,
            animation: `particleFloat 6s ease-in-out ${particle.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
