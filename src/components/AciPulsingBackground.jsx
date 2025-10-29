import React, { useEffect, useMemo, useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';

/**
 * ACI Meta Coach — Pulsing AI Background v2 (richer visual effects)
 * ----------------------------------------------------------------
 * Dark, luminous, futuristic background with:
 *  - Central pulsing AI glow
 *  - Rotating conic data sweep
 *  - Animated SIDE "neural rails" (left/right) with light streaks
 *  - Orbiting nano‑nodes (subtle, parallaxed)
 *  - Hex grid hint + vignette + scanlines + noise
 *  - Performance friendly + respects prefers-reduced-motion
 *
 * Props:
 *  - disabled?: boolean        // disable all animations
 *  - intensity?: number        // 0.5..1.5 visual strength (default 1)
 *  - showSides?: boolean       // toggle side IA rails (default true)
 *  - className?: string
 */
export default function AciPulsingBackground({
  disabled = false,
  intensity = 1,
  showSides = true,
  className = '',
  children,
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const isMobile = useIsMobile(900);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => setReducedMotion(media.matches);
      onChange();
      media.addEventListener?.('change', onChange);
      return () => media.removeEventListener?.('change', onChange);
    }
  }, []);

  const paused = disabled || reducedMotion;
  const lightweight = isMobile;

  const { glowScaleFrom, glowScaleTo, glowOpacity, sweepSpeed, noiseOpacity, railOpacity } = useMemo(() => {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const baseIntensity = lightweight ? Math.min(intensity, 0.8) : intensity;
    const i = clamp(baseIntensity, 0.35, lightweight ? 1.1 : 1.6);
    return {
      glowScaleFrom: 0.95 + (i - 1) * 0.08,
      glowScaleTo: 1.08 + (i - 1) * 0.1,
      glowOpacity: 0.28 * i,
      sweepSpeed: lightweight ? 95 / i : 60 / i,
      noiseOpacity: lightweight ? 0.012 * i : 0.035 * i,
      railOpacity: lightweight ? 0.42 * Math.min(1, i + 0.1) : 0.65 * Math.min(1, i + 0.2),
    };
  }, [intensity, lightweight]);

  return (
    <div
      className={`relative isolate min-h-screen overflow-hidden bg-[#07090c] ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(1200px_800px_at_70%_20%, rgba(0, 136, 255, 0.10), transparent 60%),
          radial-gradient(800px_800px_at_20%_80%, rgba(0, 255, 255, 0.08), transparent 60%),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: 'cover, cover, 64px 64px, 64px 64px',
        backgroundPosition: 'center, center, center, center',
      }}
    >
      {/* Central pulsing AI glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          opacity: glowOpacity,
          filter: 'blur(12px)',
          animation: paused ? 'none' : `aci-pulse 5.2s ease-in-out infinite`,
          transform: 'translateZ(0)',
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 -z-10 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(0, 180, 255, 0.65), rgba(0, 90, 160, 0.35) 40%, rgba(0, 20, 40, 0.0) 70%)',
          }}
        />
      </div>

      {/* Rotating conic data sweep */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 50%, rgba(0,180,255,0.08), rgba(0,0,0,0) 25%, rgba(0,255,255,0.06) 50%, rgba(0,0,0,0) 75%, rgba(0,180,255,0.08))',
          animation: paused || lightweight ? 'none' : `aci-rotate ${sweepSpeed}s linear infinite`,
        }}
      />

      {/* SIDE Neural Rails (left/right animated circuitry) */}
      {showSides && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-full"
            style={{
              width: lightweight ? '38vw' : '22vw',
              maxWidth: lightweight ? '200px' : '360px',
              opacity: railOpacity,
            }}
          >
            {/* layered rails */}
            <NeuralRail paused={paused} side="left" compact={lightweight} />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full"
            style={{
              width: lightweight ? '38vw' : '22vw',
              maxWidth: lightweight ? '200px' : '360px',
              opacity: railOpacity,
            }}
          >
            <NeuralRail paused={paused} side="right" compact={lightweight} />
          </div>
        </>
      )}

      {/* Orbiting nano-nodes (parallax) */}
      <NanoNodes paused={paused} compact={lightweight} />

      {/* Hex grid hint (very subtle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.18) 1px, transparent 1.2px)',
          backgroundSize: '40px 40px',
          maskImage:
            'radial-gradient(80%_80% at 50% 50%, black 50%, transparent 100%)',
        }}
      />

      {/* Vignette + scanlines */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background:
          'radial-gradient(120%_120% at 50%_60%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.78) 100%)',
      }}/>
      {!lightweight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '100% 3px',
            animation: paused ? 'none' : `aci-scan 6s linear infinite`,
            opacity: 0.25,
          }}
        />
      )}

      {/* Subtle animated noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          opacity: noiseOpacity,
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.6\"/></svg>')",
          backgroundSize: 'cover',
          animation: paused || lightweight ? 'none' : `aci-noise-shift 3s steps(2,end) infinite`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Keyframes & scoped styles */}
      <style>{`
        @keyframes aci-pulse {
          0%   { transform: translateZ(0) scale(${glowScaleFrom}); }
          50%  { transform: translateZ(0) scale(${glowScaleTo}); }
          100% { transform: translateZ(0) scale(${glowScaleFrom}); }
        }
        @keyframes aci-rotate { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes aci-noise-shift { 0%{filter:contrast(110%) brightness(110%);} 50%{filter:contrast(100%) brightness(100%);} 100%{filter:contrast(110%) brightness(110%);} }
        @keyframes aci-scan { 0%{background-position-y:0;} 100%{background-position-y:600px;} }
      `}</style>
    </div>
  );
}

/** NeuralRail — side animated circuitry with flowing streaks + SVG paths */
function NeuralRail({ paused, side = 'left', compact = false }) {
  const flip = side === 'right' ? 1 : -1;
  const originX = side === 'right' ? '100%' : '0%';
  return (
    <div className="relative h-full w-full">
      {/* gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0, 180, 255, 0.15), rgba(0, 255, 255, 0.06) 40%, rgba(0,0,0,0))',
          maskImage:
            `linear-gradient(to ${side === 'right' ? 'left' : 'right'}, black 60%, transparent 100%)`,
          filter: 'blur(0.3px)',
        }}
      />

      {/* flowing streaks */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient( to bottom, rgba(0,200,255,0.12), rgba(0,200,255,0.12) 1px, transparent 1px, transparent 14px )',
          mixBlendMode: 'screen',
          transform: `skewX(${4 * flip}deg)`
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent, rgba(0, 220, 255, 0.18), transparent)',
          backgroundSize: '200% 100%',
          animation: paused ? 'none' : `rail-sweep ${18 / 1}s linear infinite`,
          mixBlendMode: 'screen',
        }}
      />

      {/* animated SVG circuit paths */}
      <svg
        className="absolute inset-y-0"
        style={{ [side]: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 800"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M ${side === 'right' ? 100 : 0},${60 + i * 160} C ${50},${60 + i * 160} ${50},${140 + i * 160} ${side === 'right' ? 0 : 100},${140 + i * 160}`}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="1.2"
            style={{
              strokeDasharray: '8 12',
              animation: paused ? 'none' : `dash-flow ${compact ? 14 : 10 + i * 2}s linear infinite`,
              opacity: (compact ? 0.55 : 0.8) - i * 0.12,
            }}
          />
        ))}
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,200,255,0.0)" />
            <stop offset="50%" stopColor={compact ? 'rgba(0,200,255,0.6)' : 'rgba(0,200,255,0.8)'} />
            <stop offset="100%" stopColor="rgba(0,200,255,0.0)" />
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        @keyframes dash-flow { to { stroke-dashoffset: -200; } }
        @keyframes rail-sweep { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}

/** NanoNodes — small orbiting dots for AI vibe */
function NanoNodes({ paused, compact = false }) {
  const count = compact ? 6 : 10;
  return (
    <div className="pointer-events-none absolute inset-0">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="absolute left-1/2 top-1/2" style={{
          width: 0, height: 0,
          transform: `translate(-50%, -50%) rotate(${(360/count)*idx}deg)`,
        }}>
          <div
            className="absolute"
            style={{
              left: `${20 + (idx % 4) * (compact ? 5 : 8)}vmax`,
              top: `${(idx % 3) * (compact ? 1.5 : 2) - 1}vmax`,
              width: compact ? '4px' : '6px',
              height: compact ? '4px' : '6px',
              borderRadius: '9999px',
              boxShadow: '0 0 12px rgba(0,210,255,0.8)',
              background: 'radial-gradient(circle, rgba(180,255,255,0.95), rgba(0,210,255,0.8) 60%, rgba(0,210,255,0.0) 70%)',
              animation: paused ? 'none' : `node-orbit ${12 + (idx % 5) * 2}s ease-in-out infinite alternate`,
              opacity: 0.55,
              transformOrigin: 'center',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes node-orbit {
          0% { transform: translateY(-6px) scale(0.9); filter: brightness(0.9); }
          100% { transform: translateY(6px) scale(1.1); filter: brightness(1.05); }
        }
      `}</style>
    </div>
  );
}
