import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const GLTF_URL = process.env.REACT_APP_AVATAR_GLTF || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

function AstronautModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} dispose={null} />;
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

function AnimatedAstronaut({ url }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.PI / 9 + Math.sin(t * 0.4) * 0.07;
    ref.current.rotation.x = Math.sin(t * 0.25) * 0.02;
    ref.current.position.y = -1.1 + Math.sin(t * 1.1) * 0.04;
  });
  return (
    <group ref={ref} rotation={[0, Math.PI / 9, 0]} position={[0, -1.1, 0]}>
      <AstronautModel url={url} />
    </group>
  );
}

export default function AstronautHeroVideo({ width = 520 }) {
  return (
    <div
      style={{
        width,
        aspectRatio: '1 / 1',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        background:
          'linear-gradient(145deg, rgba(58,42,26,0.9) 0%, rgba(25,18,28,0.85) 35%, rgba(6,9,18,0.95) 100%)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background:
            'radial-gradient(55% 55% at 50% 30%, rgba(255,187,104,0.45), rgba(8,10,18,0) 70%)',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }}
      />
      <Canvas
        camera={{ position: [0, 1.6, 4], fov: 32 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        frameloop="always"
      >
        <StarsBackdrop />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1} position={[2, 4, 2]} />
        <React.Suspense fallback={<LoadingFallback />}>
          <AnimatedAstronaut url={GLTF_URL} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
