import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

const GLTF_URL = process.env.REACT_APP_AVATAR_GLTF || '/assets/aci-coach.glb';

function isWebGLAvailable() {
  if (typeof window === 'undefined') {
    return true;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch (error) {
    return false;
  }
}

function AstronautModel({ url }) {
  const { scene } = useGLTF(url);
  return <Clone object={scene} />;
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/70">
        Loading coach…
      </div>
    </Html>
  );
}

function StarsBackdrop({ count = 140, radius = 4.2 }) {
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const materialRef = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(1));
      const r = radius + Math.random() * 0.25;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 0.35;
      arr[i * 3 + 2] = r * Math.cos(phi) - 1.7;
    }
    return arr;
  }, [count, radius]);

  useMemo(() => {
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }, [geometry, positions]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    materialRef.current.opacity = 0.28 + Math.sin(t * 1.6) * 0.05;
    materialRef.current.size = 0.07 + Math.cos(t * 0.9) * 0.015;
  });

  return (
    <points geometry={geometry} position={[0, 0, -1.85]}>
      <pointsMaterial
        ref={materialRef}
        color="#fbe7c3"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.32}
      />
    </points>
  );
}

function AnimatedAstronaut({ url, orientation = 'right' }) {
  const ref = useRef();
  const direction = orientation === 'left' ? -1 : 1;
  const baseRotationY = direction * (Math.PI / 9);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = baseRotationY + direction * Math.sin(t * 0.4) * 0.07;
    ref.current.rotation.x = Math.sin(t * 0.25) * 0.02;
    ref.current.position.y = -1.1 + Math.sin(t * 1.1) * 0.04;
  });
  return (
    <group ref={ref} rotation={[0, baseRotationY, 0]} position={[0, -1.1, 0]}>
      <AstronautModel url={url} />
    </group>
  );
}

export default function AstronautHeroVideo({ width = 520, className = '', orientation = 'right' }) {
  const maxWidthValue = typeof width === 'number' ? `${width}px` : width;
  const [webglSupported, setWebglSupported] = useState(() => isWebGLAvailable());

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  if (!webglSupported) {
    return (
      <div
        className={`relative w-full ${className}`}
        style={{ maxWidth: maxWidthValue, minWidth: 'min(280px, 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 -z-20 rounded-[28px] bg-gradient-to-br from-[#52ffe6]/20 via-transparent to-[#fcd34d]/25 blur-[38px]" />
        <div className="pointer-events-none absolute inset-[6%] -z-30 rounded-[48px] border border-white/5" />
        <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[22px] border border-emerald-200/35 bg-[radial-gradient(65%_60%_at_50%_15%,rgba(255,220,128,0.18),rgba(6,10,18,0.95))] p-6 text-center text-sm text-white/70 shadow-[0_25px_70px_-28px_rgba(16,185,129,0.65)]">
          <span className="rounded-full border border-white/20 bg-black/60 px-4 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-200">
            Mode statique
          </span>
          <p className="max-w-[220px] leading-relaxed">
            WebGL n’est pas disponible sur cet appareil. Le coach 3D sera affiché sur un
            navigateur compatible (ordinateur ou mobile récent).
          </p>
          <p className="text-xs text-white/50">
            Aucun blocage : le reste de l’expérience fonctionne normalement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ maxWidth: maxWidthValue, minWidth: 'min(280px, 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0 -z-20 rounded-[28px] bg-gradient-to-br from-[#52ffe6]/20 via-transparent to-[#fcd34d]/25 blur-[38px]" />
      <div className="pointer-events-none absolute inset-[6%] -z-30 rounded-[48px] border border-white/5" />
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] border border-emerald-200/35 bg-[radial-gradient(65%_60%_at_50%_15%,rgba(255,220,128,0.22),rgba(6,10,18,0.9))] shadow-[0_25px_70px_-28px_rgba(16,185,129,0.65)]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.08)_70%)] opacity-50 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(45%_45%_at_50%_20%,rgba(250,204,21,0.25),rgba(15,23,42,0))]" />

        <div className="pointer-events-none absolute left-6 top-6 z-20 flex items-center gap-3 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-emerald-100 shadow-[0_12px_30px_-18px_rgba(59,130,246,0.65)] backdrop-blur-md">
          <span className="h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,1)_0%,rgba(190,149,34,0.4)_60%,rgba(250,204,21,0)_100%)] shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
          ACI Coach
        </div>

        <Canvas
          camera={{ position: [0, 1.6, 4], fov: 32 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
          frameloop="always"
          style={{ width: '100%', height: '100%' }}
        >
          <StarsBackdrop />
          <ambientLight intensity={0.8} />
          <directionalLight intensity={1.35} position={[2.2, 3.8, 1.6]} color="#fbe18c" />
          <directionalLight intensity={0.6} position={[-2, 3, -1]} color="#34d399" />
          <React.Suspense fallback={<LoadingFallback />}>
            <AnimatedAstronaut url={GLTF_URL} orientation={orientation} />
          </React.Suspense>
        </Canvas>

        <div className="pointer-events-none absolute inset-x-6 bottom-6 z-20 rounded-2xl border border-emerald-200/20 bg-black/65 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-emerald-100/80">
            Mode focus
            <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-emerald-100">
              Concierge IA
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/80">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/70">Profil</p>
              <p className="mt-1 font-semibold text-white">Analyse comportementale prête</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/70">Business</p>
              <p className="mt-1 font-semibold text-white">3 idées qualifiées</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/70">Conciergerie</p>
              <p className="mt-1 font-semibold text-white">Rendez-vous en cours</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/70">Mindset</p>
              <p className="mt-1 font-semibold text-white">Routine anti-stress activée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(GLTF_URL);
