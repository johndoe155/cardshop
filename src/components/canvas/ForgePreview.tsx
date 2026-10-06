'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTexture, OrbitControls, PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import { useVaultStore } from '@/store/useVaultStore';
import { easing } from 'maath';
import { deviceTilt, tiltTarget } from '@/lib/deviceTilt';
import {
  finishIndex,
  prepareTexture,
  updateHoloMaterial,
  type HoloMaterial,
} from '@/components/canvas/HoloMaterial'; // registers holoShaderMaterial via extend()

const CARD_ASPECT = 2.2 / 3.0;

function SlabMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<HoloMaterial>(null);
  const finishType = useVaultStore((s) => s.finishType);
  const nftData = useVaultStore((s) => s.nftData);
  const gl = useThree((s) => s.gl);
  const isCoarsePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    []
  );

  const imageUrl = nftData?.image || 'https://picsum.photos/seed/forge/800/800';
  const texture = useTexture(imageUrl);

  // Applied during render, not in an effect: the texture would otherwise get
  // one frame on the GPU with the wrong (linear) transfer function.
  useMemo(() => prepareTexture(texture, gl), [texture, gl]);

  // Pointer ON the card: e.uv is the intersection uv, so the holo hotspot sits
  // exactly under the cursor instead of tracking the whole window.
  const pointerUv = useRef(new THREE.Vector2(0.5, 0.5));
  const tilt = useRef(new THREE.Vector2(0, 0));
  const finishInit = useRef(false);

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    pointerUv.current.set(e.uv.x, e.uv.y);
  };
  const onPointerOut = () => pointerUv.current.set(0.5, 0.5);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    tiltTarget(tilt.current, pointerUv.current.x, pointerUv.current.y);
    updateHoloMaterial(materialRef.current, {
      time,
      delta,
      finish: finishIndex(finishType),
      intensity: 1.2,
      texture,
      pointer: pointerUv.current,
      tilt: tilt.current,
      init: finishInit,
    });

    // Gentle rotation — and on touch, gyro adds a little extra sway so the
    // foil keeps moving without a finger on the glass.
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1 + (isCoarsePointer ? deviceTilt.y * 0.12 : 0);
    if (isCoarsePointer) {
      easing.damp(meshRef.current.rotation, 'z', deviceTilt.x * -0.1, 0.3, delta);
    }

    // Float
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.05;
  });

  return (
    // One rigid assembly: card, border, label and case turn together. The card
    // used to spin *inside* a static border and case, which meant it sliced
    // through both at every quarter turn.
    <group ref={meshRef}>
      <mesh
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
      >
        <boxGeometry args={[2.2, 3.0, 0.12]} />
        <holoShaderMaterial
          ref={materialRef}
          uImage={texture}
          uCardAspect={CARD_ASPECT}
        />
      </mesh>

      {/* Slab border */}
      <mesh position={[0, 0, -0.02]} scale={[1.08, 1.06, 1]} raycast={() => null}>
        <boxGeometry args={[2.2, 3.0, 0.1]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Label */}
      <mesh position={[0, -1.1, 0.07]} raycast={() => null}>
        <planeGeometry args={[1.8, 0.45]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Acrylic vitrine — child of the assembly so the slab can never rotate
          out through its own case. */}
      <AcrylicCase />
    </group>
  );
}

/**
 * Acrylic display case. Real transmission (refraction through the slab behind
 * it) only works where the canvas is contained — this one is, so the Forge gets
 * the museum vitrine. Thicker/beefier case for the thicker slab tiers.
 * raycast is disabled so it never steals the pointer from the card face.
 */
function AcrylicCase() {
  const slabType = useVaultStore((s) => s.slabType);
  const spec = {
    standard: { depth: 0.5, thickness: 0.35, ior: 1.45 },
    premium: { depth: 0.72, thickness: 0.6, ior: 1.48 },
    vault: { depth: 0.95, thickness: 0.9, ior: 1.52 },
  }[slabType];

  return (
    <mesh raycast={() => null}>
      <boxGeometry args={[2.5, 3.32, spec.depth]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={1}
        thickness={spec.thickness}
        ior={spec.ior}
        roughness={0.05}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.03}
        attenuationColor="#dff2ff"
        attenuationDistance={8}
        envMapIntensity={1.4}
        specularIntensity={1}
      />
    </mesh>
  );
}

/**
 * Opaque backdrop. The canvas is alpha-composited, so without this the
 * transmission pass has nothing but clear-alpha to refract at the case rim and
 * the acrylic picks up black fringes. It also gives the env reflections
 * something to sit against.
 */
function Backdrop() {
  return (
    <mesh position={[0, 0, -3]} raycast={() => null}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#050505" roughness={1} metalness={0} />
    </mesh>
  );
}

function FinishBloom() {
  const finishType = useVaultStore((s) => s.finishType);
  const intensity =
    finishType === 'gold' ? 1.0 :
    finishType === 'holo' ? 0.85 :
    finishType === 'cracked-ice' ? 0.45 :
    0.12;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={intensity} luminanceThreshold={0.85} luminanceSmoothing={0.15} radius={0.72} />
    </EffectComposer>
  );
}

export function ForgePreviewCanvas() {
  return (
    <div className="w-full h-full min-h-[500px] relative bg-[#050505] overflow-hidden">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 35 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#FF4D00" />
        <pointLight position={[0, 2, 2]} intensity={0.8} color="#00E5FF" />

        {/* Baked studio: soft key from above, brand-orange kicker on one side,
            cyan rim on the other. Feeds both the plastic border's reflections
            and the acrylic case's refraction. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, 3]} scale={[8, 4, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={2.4} color="#FF4D00" position={[-4, 0.5, 2]} scale={[3, 7, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={2} color="#00E5FF" position={[4, -1, 2]} scale={[3, 7, 1]} target={[0, 0, 0]} />
          <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 0, 5]} scale={4} target={[0, 0, 0]} />
          <Lightformer form="circle" intensity={1.2} color="#1a1a1a" position={[0, -3, -2]} scale={6} target={[0, 0, 0]} />
        </Environment>

        <Backdrop />
        <SlabMesh />
        <FinishBloom />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={false}
          rotateSpeed={0.5}
        />

        <fog attach="fog" args={['#050505', 5, 12]} />
      </Canvas>

      <div className="absolute top-4 left-4 font-mono text-[9px] px-2 py-1 bg-black/60 text-white/60 border border-white/10 backdrop-blur">
        ● LIVE • WEBGL • DRAG TO SPIN
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="font-mono text-[9px] text-[#F5F3EF]/30">
          SHADER: GLSL • 60FPS • POINTER REACTIVE
        </div>
        <div className="font-mono text-[9px] text-[#FF4D00]">
          TRUE OPTICAL PREVIEW
        </div>
      </div>
    </div>
  );
}
