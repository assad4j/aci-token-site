import React, { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

const DEFAULT_GLTF = process.env.REACT_APP_AVATAR_GLTF || null;

function AvatarModel({ gltfPath, mouthOpen, mood, onLoaded }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const mouthValue = useRef(0);
  const { scene } = useGLTF(gltfPath);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!modelRef.current) return;
    const target = modelRef.current;
    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    target.position.sub(center);
    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = maxAxis > 0 ? 1.65 / maxAxis : 1;
    target.scale.setScalar(scale);
    onLoaded?.();
  }, [onLoaded, clonedScene]);

  const morphTargets = useMemo(() => {
    const targets = [];
    clonedScene.traverse(obj => {
      if (obj.isMesh && obj.morphTargetDictionary) {
        const index =
          obj.morphTargetDictionary.MouthOpen ??
          obj.morphTargetDictionary.mouthOpen ??
          obj.morphTargetDictionary['O'] ??
          obj.morphTargetDictionary['viseme_O'];
        if (typeof index === 'number') {
          targets.push({ mesh: obj, index });
        }
      }
    });
    return targets;
  }, [clonedScene]);

  const materialTargets = useMemo(() => {
    const mats = [];
    clonedScene.traverse(obj => {
      if (obj.isMesh && obj.material && obj.material.color) {
        mats.push(obj.material);
      }
    });
    return mats;
  }, [clonedScene]);

  const moodColors = {
    calm: new THREE.Color('#10b981'),
    energetic: new THREE.Color('#f59e0b'),
    neutral: new THREE.Color('#38bdf8'),
  };

  useFrame(() => {
    const targetOpen = THREE.MathUtils.clamp(mouthOpen, 0, 1);
    mouthValue.current = THREE.MathUtils.lerp(mouthValue.current, targetOpen, 0.18);
    morphTargets.forEach(({ mesh, index }) => {
      mesh.morphTargetInfluences[index] = mouthValue.current;
    });
    const color = moodColors[mood] || moodColors.neutral;
    materialTargets.forEach(material => {
      material.emissive = color.clone().multiplyScalar(0.35);
    });
  });

  return (
    <group ref={groupRef}>
      <primitive ref={modelRef} object={clonedScene} dispose={null} />
    </group>
  );
}

function AvatarFallback() {
  return (
    <Html center>
      <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-xs text-white/80 backdrop-blur">
        Loading avatar…
      </div>
    </Html>
  );
}

export default function Avatar3D({
  gltfPath = DEFAULT_GLTF,
  mouthOpen = 0,
  mood = 'neutral',
  onLoaded,
  isVisible = true,
  onError,
}) {
  const handleError = () => {
    onError?.();
  };

  return (
    <div className="relative mx-auto flex-none h-72 w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/15 bg-black/40 cursor-grab active:cursor-grabbing sm:h-80 lg:h-96">
      {isVisible && (
        <Canvas camera={{ position: [0, 1.6, 4], fov: 32 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 4, 2]} intensity={0.9} />
          <AvatarErrorBoundary fallback={<AvatarFallback />} onError={handleError}>
            <Suspense fallback={<AvatarFallback />}>
              {gltfPath ? (
                <>
                  <AvatarModel gltfPath={gltfPath} mouthOpen={mouthOpen} mood={mood} onLoaded={onLoaded} />
                  <Environment preset="sunset" />
                </>
              ) : (
                <FallbackBall mouthOpen={mouthOpen} mood={mood} />
              )}
            </Suspense>
          </AvatarErrorBoundary>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate
            target={[0, 0.6, 0]}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI - Math.PI / 3.2}
          />
        </Canvas>
      )}
    </div>
  );
}

if (DEFAULT_GLTF) {
  useGLTF.preload(DEFAULT_GLTF);
}

function FallbackBall({ mouthOpen, mood }) {
  const sphereRef = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const timeRef = useRef(0);

  const colors = {
    calm: '#10b981',
    energetic: '#f59e0b',
    neutral: '#38bdf8',
  };
  const emissive = new THREE.Color(colors[mood] || colors.neutral);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const pulse = 1 + mouthOpen * 0.2 + Math.sin(timeRef.current * 2) * 0.05;
    if (sphereRef.current) {
      sphereRef.current.scale.setScalar(0.85 * pulse);
      sphereRef.current.rotation.y += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.6;
    }
    if (glowRef.current) {
      const intensity = 0.4 + mouthOpen * 0.4;
      glowRef.current.material.emissiveIntensity = intensity;
    }
  });

  return (
    <group>
      <mesh ref={glowRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshStandardMaterial
          color={emissive.clone().multiplyScalar(0.6)}
          emissive={emissive}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={sphereRef} position={[0, 1.1, 0]}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#111827"
          emissive={emissive.clone().multiplyScalar(0.5)}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.07, 32, 128]} />
        <meshStandardMaterial
          color={emissive.clone().multiplyScalar(1.2)}
          emissive={emissive}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      <pointLight position={[0, 2.4, 0]} intensity={0.8} color={emissive} distance={8} />
    </group>
  );
}

class AvatarErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[coach3d] avatar failed to load', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
