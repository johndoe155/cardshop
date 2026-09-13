'use client';
import { Canvas } from '@react-three/fiber';
import { Preload, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { HeroSlab } from './HeroSlab';
import { useVaultStore } from '@/store/useVaultStore';

function Scene() {
  const { activeSection } = useVaultStore();
  
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
