'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useVaultStore } from '@/store/useVaultStore';
import { easing } from 'maath';
import { deviceTilt, tiltTarget } from '@/lib/deviceTilt';
import {
  finishIndex,
  prepareTexture,
  updateHoloMaterial,
  type HoloMaterial,
} from './HoloMaterial';
import '@/components/canvas/HoloMaterial'; // registers holoShaderMaterial via extend()

const CARD_ASPECT = 2.2 / 3.0;

export function HeroSlab() {
  const groupRef = useRef<THREE.Group>(null);
  const matFrontRef = useRef<HoloMaterial>(null);
  const matBackRef = useRef<HoloMaterial>(null);
  const finishType = useVaultStore((s) => s.finishType);
  const nftData = useVaultStore((s) => s.nftData);
  const gl = useThree((s) => s.gl);
  // Touch devices: pointermove fires mid-scroll with huge positional jumps,
  // which made the slab lurch. On coarse pointers the GROUP tilt ignores the
  // pointer entirely (scroll + gyro carry it instead) — the shader's foil
  // hotspot is separate and still follows a finger straight off e.uv.
  const isCoarsePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    []
  );

  // Default texture or NFT
  const imageUrl = nftData?.image || 'https://picsum.photos/seed/nemohero/800/800';
  const texture = useTexture(imageUrl);

  // Applied during render, not in an effect: the texture would otherwise get
  // one frame on the GPU with the wrong (linear) transfer function.
  useMemo(() => prepareTexture(texture, gl), [texture, gl]);

  // Pointer position ON THE CARD (0..1 uv), not the window. R3F gives us the
  // intersection uv, so the highlight sits exactly under the cursor — the old
  // window-normalised pointer parked the glow wherever the cursor happened to
  // be on the page, even when it was nowhere near the slab.
  const pointerUv = useRef(new THREE.Vector2(0.5, 0.5));
  const tilt = useRef(new THREE.Vector2(0, 0));
  const finishInit = useRef(false);

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    pointerUv.current.set(e.uv.x, e.uv.y);
  };
  const onPointerOut = () => {
    // Drift the hotspot back to centre when the cursor leaves the slab.
    pointerUv.current.set(0.5, 0.5);
  };

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const time = state.clock.elapsedTime;
    // Window pointer is still used for the group tilt only — read imperatively,
    // never a React re-render source.
    const { pointer } = useVaultStore.getState();

    // Hero-local scroll: 0 at top -> 1 after one viewport. Read straight from
    // window.scrollY so it behaves identically under Lenis (desktop) and
    // native touch scrolling — the store's scrollProgress is Lenis-event-driven
    // and does not tick on touch, which is why the parallax felt dead on phones.
    const vh = window.innerHeight || 1;
    const local = Math.min(1, Math.max(0, (window.scrollY || 0) / vh));

    tiltTarget(tilt.current, pointerUv.current.x, pointerUv.current.y);
    const ctx = {
      time,
      delta,
      finish: finishIndex(finishType),
      intensity: 1,
      texture,
      pointer: pointerUv.current,
      tilt: tilt.current,
      init: finishInit,
    };
    for (const m of [matFrontRef.current, matBackRef.current]) {
      updateHoloMaterial(m, ctx);
    }

    // RIGID SLAB: tilt/parallax apply to the GROUP so card, border, label and
    // foil move as one unit. Tilting only the card mesh made it swing outside
    // its static border box, exposing large sheets of orange-lit dark plastic
    // (the "brown flood") where the boxes intersected. Amplitudes are sized
    // for this hero-local driver (the old ones were tuned for whole-page
    // progress — ~10x too hot): max ~7deg, gentle recede, thin clean edge.
    const scrollTiltX = -local * 0.12;
    if (!isCoarsePointer) {
      const targetRotX = (pointer.y - 0.5) * 0.4 + scrollTiltX;
      const targetRotY = (pointer.x - 0.5) * -0.65;
      easing.dampE(group.rotation, [targetRotX, targetRotY, 0], 0.4, delta);
    } else {
      // Touch: scroll is the only tilt driver — inherently smooth, never jumpy
      // (unlike pointermove, which fires mid-scroll with positional jumps).
      // deviceTilt (gyro) still drives the foil hue through uTilt.
      easing.dampE(group.rotation, [scrollTiltX + deviceTilt.y * 0.06, deviceTilt.x * -0.08, 0], 0.5, delta);
    }

    // Parallax: recede + slight grow — apparent size shrinks ~11% over the
    // first viewport, a true recede (the old 0.5 growth cancelled perspective,
    // which is also why it read as "no parallax").
    easing.damp(group.position, 'z', -local * 1.2, 0.5, delta);
    const s = 1 + local * 0.15;
    easing.damp3(group.scale, [s, s, s], 0.5, delta);

    // Subtle float
    group.position.y = Math.sin(time * 0.5) * 0.05;

    // Sanitary: this canvas is FIXED and sits behind every section; opaque
    // section backgrounds normally hide the slab, but during very fast scrolls
    // the compositor can present before the newly-exposed tiles are painted,
    // flashing the slab mid-page. Past the hero there is nothing to draw —
    // skip it entirely so a paint-lag frame shows only the dark page.
    group.visible = local < 0.95;
  });

  return (
    <group ref={groupRef}>
      {/* Main slab — 6-material box: dark plastic sides, holo shader on the
          front/back faces only, so tilted sides render as clean plastic. */}
      <mesh
        position={[0, 0, 0]}
        scale={1}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
      >
        <boxGeometry args={[2.2, 3.0, 0.12]} />
        <meshPhysicalMaterial attach="material-0" color="#141414" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <meshPhysicalMaterial attach="material-1" color="#141414" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <meshPhysicalMaterial attach="material-2" color="#0f0f0f" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <meshPhysicalMaterial attach="material-3" color="#0f0f0f" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <holoShaderMaterial
          attach="material-4"
          ref={matFrontRef}
          uImage={texture}
          uCardAspect={CARD_ASPECT}
          uIntensity={1}
        />
        <holoShaderMaterial
          attach="material-5"
          ref={matBackRef}
          uImage={texture}
          uCardAspect={CARD_ASPECT}
          uIntensity={1}
        />
      </mesh>

      {/* Slab border - thicker plastic. raycast is disabled so it never sits
          between the cursor and the card face (pointer must stay on the slab). */}
      <mesh position={[0, 0, -0.01]} scale={[1.08, 1.06, 1]} raycast={() => null}>
        <boxGeometry args={[2.2, 3.0, 0.1]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
          envMapIntensity={1.1}
        />
      </mesh>

      {/* Label area at bottom */}
      <mesh position={[0, -1.1, 0.07]} raycast={() => null}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Foil edge */}
      <mesh position={[0, 0, 0.065]} raycast={() => null}>
        <boxGeometry args={[2.22, 3.02, 0.01]} />
        <meshBasicMaterial color="#FF4D00" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Simpler version for gallery
type GallerySlabProps = {
  image: string;
  finish?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export function GallerySlab({ image, finish = 'holo', position = [0, 0, 0], rotation = [0, 0, 0] }: GallerySlabProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<HoloMaterial>(null);
  const texture = useTexture(image);
  const gl = useThree((s) => s.gl);
  const pointerUv = useRef(new THREE.Vector2(0.5, 0.5));
  const tilt = useRef(new THREE.Vector2(0, 0));
  const finishInit = useRef(false);

  // Applied during render, not in an effect: the texture would otherwise get
  // one frame on the GPU with the wrong (linear) transfer function.
  useMemo(() => prepareTexture(texture, gl), [texture, gl]);

  useFrame((state, delta) => {
    tiltTarget(tilt.current, pointerUv.current.x, pointerUv.current.y);
    updateHoloMaterial(materialRef.current, {
      time: state.clock.elapsedTime,
      delta,
      finish: finishIndex(finish),
      intensity: 1,
      texture,
      pointer: pointerUv.current,
      tilt: tilt.current,
      init: finishInit,
    });
    // slow auto rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerMove={(e) => {
        if (!e.uv) return;
        pointerUv.current.set(e.uv.x, e.uv.y);
      }}
      onPointerOut={() => pointerUv.current.set(0.5, 0.5)}
    >
      <boxGeometry args={[1.6, 2.2, 0.08]} />
      <holoShaderMaterial
        ref={materialRef}
        uImage={texture}
        uCardAspect={1.6 / 2.2}
      />
    </mesh>
  );
}
