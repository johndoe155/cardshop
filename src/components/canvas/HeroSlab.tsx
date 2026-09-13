'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useVaultStore } from '@/store/useVaultStore';
import { easing } from 'maath';

export function HeroSlab() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { pointer, finishType, nftData, scrollProgress } = useVaultStore();
  
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
    if (!meshRef.current || !materialRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Pointer lerp
    easing.damp2(materialRef.current.uniforms.uPointer.value, [pointer.x, 1 - pointer.y], 0.15, delta);
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uFinish.value = finishMap[finishType];
    
    // Tilt based on pointer
    const targetRotX = (pointer.y - 0.5) * 0.5;
    const targetRotY = (pointer.x - 0.5) * -0.8;
    
    easing.dampE(meshRef.current.rotation, [targetRotX, targetRotY, 0], 0.25, delta);
    
    // Scroll effect: scale and move
    const scroll = scrollProgress;
    const targetZ = -scroll * 2;
    const targetScale = 1 + scroll * 0.5;
    easing.damp(meshRef.current.position, 'z', targetZ, 0.3, delta);
    easing.damp3(meshRef.current.scale, [targetScale, targetScale, targetScale], 0.3, delta);
    
    // Subtle float
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <group>
      {/* Main slab */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1}>
        <boxGeometry args={[2.2, 3.0, 0.12]} />
        {/* @ts-ignore */}
        <holoShaderMaterial
          ref={materialRef}
          uImage={texture}
          uFinish={finishMap[finishType]}
          uIntensity={1}
          uTime={0}
          uPointer={new THREE.Vector2(0.5, 0.5)}
        />
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
