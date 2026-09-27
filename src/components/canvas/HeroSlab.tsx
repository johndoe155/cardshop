'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useVaultStore } from '@/store/useVaultStore';
import { easing } from 'maath';

export function HeroSlab() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matFrontRef = useRef<any>(null);
  const matBackRef = useRef<any>(null);
  const finishType = useVaultStore((s) => s.finishType);
  const nftData = useVaultStore((s) => s.nftData);
  // Touch devices: pointermove fires mid-scroll with huge positional jumps,
  // which made the slab lurch. On coarse pointers we skip pointer-driven tilt
  // and uPointer chase entirely — the auto-float carries the motion instead.
  const isCoarsePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    []
  );
  
  // Map finish type to shader uniform
  const finishMap = { 'base': 0, 'holo': 1, 'cracked-ice': 2, 'gold': 3 } as const;
  
  // Default texture or NFT
  const imageUrl = nftData?.image || 'https://picsum.photos/seed/nemohero/800/800';
  const texture = useTexture(imageUrl);
  
  // Enhance texture
  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;
    // Pointer is read imperatively — never a React re-render source.
    const { pointer } = useVaultStore.getState();

    // Hero-local scroll: 0 at top -> 1 after one viewport. Read straight from
    // window.scrollY so it behaves identically under Lenis (desktop) and
    // native touch scrolling — the store's scrollProgress is Lenis-event-driven
    // and does not tick on touch, which is why the parallax felt dead on phones.
    const vh = window.innerHeight || 1;
    const local = Math.min(1, Math.max(0, (window.scrollY || 0) / vh));

    for (const m of [matFrontRef.current, matBackRef.current]) {
      if (!m) continue;
      m.uniforms.uTime.value = time;
      m.uniforms.uFinish.value = finishMap[finishType];
      if (!isCoarsePointer) {
        easing.damp2(m.uniforms.uPointer.value, [pointer.x, 1 - pointer.y], 0.2, delta);
      } else {
        easing.damp2(m.uniforms.uPointer.value, [0.5, 0.5], 0.6, delta);
      }
    }

    // Scroll-driven tilt on every device — this reveals the slab's clean dark
    // edge beside the card face as you scroll (the slanted-segment parallax).
    const scrollTiltX = -local * 0.3;
    if (!isCoarsePointer) {
      const targetRotX = (pointer.y - 0.5) * 0.4 + scrollTiltX;
      const targetRotY = (pointer.x - 0.5) * -0.65;
      easing.dampE(mesh.rotation, [targetRotX, targetRotY, 0], 0.4, delta);
    } else {
      // Touch: scroll is the only tilt driver — inherently smooth, never jumpy
      // (unlike pointermove, which fires mid-scroll with positional jumps).
      easing.dampE(mesh.rotation, [scrollTiltX, 0, 0], 0.5, delta);
    }

    // Parallax: recede + grow as the hero scrolls away.
    easing.damp(mesh.position, 'z', -local * 2, 0.5, delta);
    const s = 1 + local * 0.5;
    easing.damp3(mesh.scale, [s, s, s], 0.5, delta);

    // Subtle float
    mesh.position.y = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <group>
      {/* Main slab — 6-material box: dark plastic sides, holo shader on the
          front/back faces only. Previously every face used the card shader, so
          tilted sides sampled the texture at edge UVs and rendered as a muddy
          brown smear. The clean dark edge is what shows beside the card when
          scroll-tilt kicks in. */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1}>
        <boxGeometry args={[2.2, 3.0, 0.12]} />
        <meshPhysicalMaterial attach="material-0" color="#141414" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <meshPhysicalMaterial attach="material-1" color="#141414" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <meshPhysicalMaterial attach="material-2" color="#0f0f0f" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        <meshPhysicalMaterial attach="material-3" color="#0f0f0f" roughness={0.35} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.25} />
        {/* @ts-ignore */}
        <holoShaderMaterial attach="material-4" ref={matFrontRef} uImage={texture} uFinish={finishMap[finishType]} uIntensity={1} uTime={0} uPointer={new THREE.Vector2(0.5, 0.5)} />
        {/* @ts-ignore */}
        <holoShaderMaterial attach="material-5" ref={matBackRef} uImage={texture} uFinish={finishMap[finishType]} uIntensity={1} uTime={0} uPointer={new THREE.Vector2(0.5, 0.5)} />
      </mesh>
      
      {/* Slab border - thicker plastic */}
      <mesh position={[0, 0, -0.01]} scale={[1.08, 1.06, 1]}>
        <boxGeometry args={[2.2, 3.0, 0.1]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Label area at bottom */}
      <mesh position={[0, -1.1, 0.07]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
      
      {/* Foil edge */}
      <mesh position={[0, 0, 0.065]}>
        <boxGeometry args={[2.22, 3.02, 0.01]} />
        <meshBasicMaterial color="#FF4D00" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Simpler version for gallery
export function GallerySlab({ image, finish = 'holo', position = [0,0,0] as any, rotation = [0,0,0] as any }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const texture = useTexture(image);
  const finishMap = { 'base': 0, 'holo': 1, 'cracked-ice': 2, 'gold': 3 } as const;

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uFinish.value = finishMap[finish as keyof typeof finishMap] ?? 1;
    // slow auto rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[1.6, 2.2, 0.08]} />
      {/* @ts-ignore */}
      <holoShaderMaterial
        ref={materialRef}
        uImage={texture}
        uFinish={finishMap[finish as keyof typeof finishMap] ?? 1}
        uPointer={new THREE.Vector2(0.5, 0.5)}
      />
    </mesh>
  );
}
