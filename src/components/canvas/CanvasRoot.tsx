'use client';
import { Canvas } from '@react-three/fiber';
import { Preload, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense } from 'react';
import { HeroSlab } from './HeroSlab';
import { useVaultStore } from '@/store/useVaultStore';

/**
 * Post-processing, tuned deliberately:
 * - luminanceThreshold 0.85 → only the hottest fresnel/foil highlights bloom;
 *   the card artwork itself (rarely above 0.85 luminance) stays untouched, and
 *   DOM spec text can't bleed since it lives outside the canvas.
 * - Intensity scales with finish: holo/gold sell the "light-reactive" concept,
 *   base stays nearly clean.
 */
function FinishBloom() {
  const { finishType } = useVaultStore();
  const intensity =
    finishType === 'gold' ? 0.9 :
    finishType === 'holo' ? 0.75 :
    finishType === 'cracked-ice' ? 0.4 :
    0.12;
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={intensity} luminanceThreshold={0.85} luminanceSmoothing={0.15} radius={0.72} />
    </EffectComposer>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#FF4D00" />
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#00E5FF" />

      <Suspense fallback={null}>
        <HeroSlab />
      </Suspense>

      <FinishBloom />

      {/* Fog for depth */}
      <fog attach="fog" args={['#080808', 5, 15]} />
    </>
  );
}

export function CanvasRoot() {
  return (
    <div className="fixed inset-0 w-full h-[100vh] pointer-events-none z-0">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <Scene />
        <Preload all />
      </Canvas>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.8) 100%)`
      }} />
    </div>
  );
}
