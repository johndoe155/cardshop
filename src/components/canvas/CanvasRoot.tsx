'use client';
import { Canvas } from '@react-three/fiber';
import { Preload, PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import { Suspense } from 'react';
import { HeroSlab } from './HeroSlab';

// NOTE: no post-processing here, deliberately. This canvas is full-viewport,
// FIXED, and alpha-composited over the page; a Bloom composer on a transparent
// HalfFloat buffer can produce visible background artifacts (milky/dark veil
// from premultiplied-alpha mismatch, black-bleed in the blur kernel) — which
// read as "the hero background looks off". The shader's fresnel highlight is
// strong enough to carry the hero without bloom. Bloom lives in ForgePreview
// only, where the canvas is opaque and contained.
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#FF4D00" />
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#00E5FF" />

      {/* Baked once (frames={1}) from a handful of Lightformers — gives the
          slab's plastic border and foil edge something to reflect. No HDR
          download, and it costs one render pass at mount. */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 3, 2]} scale={[6, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.6} color="#FF4D00" position={[-3.5, 0, 1.5]} scale={[3, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#00E5FF" position={[3.5, -1, 1.5]} scale={[3, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 0, 4]} scale={3} target={[0, 0, 0]} />
      </Environment>

      <Suspense fallback={null}>
        <HeroSlab />
      </Suspense>

      {/* Fog for depth */}
      <fog attach="fog" args={['#080808', 5, 15]} />
    </>
  );
}

export function CanvasRoot() {
  // The hero canvas is FIXED, pointer-events:none and sits *behind* the page,
  // so it can never be the topmost hit target — R3F pointer events would never
  // fire and the foil would keep using the window-wide pointer. Routing the
  // event source to <body> lets every pointermove bubble up to R3F, which then
  // raycasts and hands us the exact uv on the slab. R3F flips the canvas'
  // own pointer-events to none automatically when eventSource is set.
  const eventSource = typeof document === 'undefined' ? undefined : document.body;

  return (
    <div className="fixed inset-0 w-full h-[100vh] pointer-events-none z-0">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        frameloop="always"
        eventSource={eventSource}
        eventPrefix="client"
        style={{ background: 'transparent', pointerEvents: 'none' }}
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
