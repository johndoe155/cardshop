'use client';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { galleryData } from '@/data/gallery';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVaultStore } from '@/store/useVaultStore';
import { tiltTarget } from '@/lib/deviceTilt';
import { sounds } from '@/lib/sounds';
import {
  finishIndex,
  prepareTexture,
  updateHoloMaterial,
  type HoloMaterial,
} from '@/components/canvas/HoloMaterial'; // registers holoShaderMaterial via extend()

const CARD_W = 1.6;
const CARD_H = 2.2;
const CARD_D = 0.1;
const HALF_W = CARD_W / 2;
const HALF_H = CARD_H / 2;
const HALF_D = CARD_D / 2;
const CARD_ASPECT = CARD_W / CARD_H;

// A pointer that travels less than this (in css px, summed over the drag) is a
// tap -> "click to forge". Anything more is a drag/toss and must not navigate.
const DRAG_THRESHOLD = 8;

const Z_NORMAL = new THREE.Vector3(0, 0, 1);

/** R3F swaps `target` for its capture shim; both shapes expose the same API. */
type CaptureTarget = {
  setPointerCapture?: (id: number) => void;
  releasePointerCapture?: (id: number) => void;
};
const captureApi = (e: { target: unknown }) => e.target as CaptureTarget;

const tmpVec = new THREE.Vector3();
const tmpPlaneHit = new THREE.Vector3();

type Spawn = { rx: number; ry: number; rz: number };

/** Cheap deterministic 0..1 hash so spawn layout is stable across renders. */
function hashSeed(seed: string): Spawn {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const r = (n: number) => (((h >>> (n * 8)) & 0xff) / 255 + ((h >>> (n * 3 + 4)) & 0x7f) / 127) * 0.5;
  return { rx: r(0) - 0.5, ry: r(1), rz: r(2) - 0.5 };
}

function Card({ image, finish, spawn, index, onSelect }: {
  image: string;
  finish: string;
  spawn: Spawn;
  index: number;
  onSelect: () => void;
}) {
  const rigidRef = useRef<RapierRigidBody>(null);
  const materialRef = useRef<HoloMaterial>(null);
  const texture = useTexture(image);
  const gl = useThree((s) => s.gl);
  // Viewport in world units — the walls are derived from this too, so the pit
  // is sealed exactly to whatever the canvas measures (no more ±7.5 hardcode
  // that let cards drift off-screen on a narrow phone).
  const viewport = useThree((s) => s.viewport);
  const bounds = useRef({ w: viewport.width, h: viewport.height });
  const setCursor = useVaultStore((s) => s.setCursor);

  useEffect(() => {
    bounds.current = { w: viewport.width, h: viewport.height };
  }, [viewport.width, viewport.height]);

  // Applied during render, not in an effect: the texture would otherwise get
  // one frame on the GPU with the wrong (linear) transfer function.
  useMemo(() => prepareTexture(texture, gl), [texture, gl]);

  const pointerUv = useRef(new THREE.Vector2(0.5, 0.5));
  const tilt = useRef(new THREE.Vector2(0, 0));
  const finishInit = useRef(false);
  const hoverRef = useRef(false);
  const spawned = useRef(false);

  const drag = useRef({
    active: false,
    pointerId: -1,
    plane: new THREE.Plane(),
    offset: new THREE.Vector3(),
    target: new THREE.Vector3(),
    last: new THREE.Vector2(),
    travel: 0,
  });

  // ---------------------------------------------------------------- pointer
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    // e.uv is the intersection on the card itself, so the foil hotspot tracks
    // the cursor across the slab instead of across the whole window.
    if (e.uv) pointerUv.current.set(e.uv.x, e.uv.y);

    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    const ne = e.nativeEvent;
    d.travel += Math.abs(ne.clientX - d.last.x) + Math.abs(ne.clientY - d.last.y);
    d.last.set(ne.clientX, ne.clientY);
    // Drag on the plane the card was grabbed from, keeping the grab offset so
    // the slab never snaps its centre to the cursor.
    if (e.ray.intersectPlane(d.plane, tmpPlaneHit)) {
      const { w, h } = bounds.current;
      const maxX = Math.max(0.15, w / 2 - HALF_W - 0.05);
      const maxY = Math.max(0.15, h / 2 - HALF_H - 0.05);
      d.target.set(
        THREE.MathUtils.clamp(tmpPlaneHit.x + d.offset.x, -maxX, maxX),
        THREE.MathUtils.clamp(tmpPlaneHit.y + d.offset.y, -maxY, maxY),
        d.target.z
      );
    }
  };

  const endDrag = useCallback((release: boolean) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const body = rigidRef.current;
    if (body && release) {
      // TOSS: hand the drag velocity back to the solver, boosted and capped so
      // a flick throws the slab but never launches it through a wall.
      const v = body.linvel();
      const speed = Math.hypot(v.x, v.y);
      const capped = Math.min(16, speed * 1.35);
      const scale = speed > 0.0001 ? capped / speed : 0;
      body.setLinvel({ x: v.x * scale, y: v.y * scale, z: v.z * 0.25 }, true);
      body.setAngvel({ x: 0, y: 0, z: THREE.MathUtils.clamp(v.x * -0.7, -7, 7) }, true);
      sounds.slabClack();
    }
  }, []);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    const body = rigidRef.current;
    if (!body) return;
    e.stopPropagation();
    try {
      captureApi(e).setPointerCapture?.(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    const d = drag.current;
    const t = body.translation();
    d.active = true;
    d.pointerId = e.pointerId;
    d.travel = 0;
    d.last.set(e.nativeEvent.clientX, e.nativeEvent.clientY);
    d.plane.setFromNormalAndCoplanarPoint(Z_NORMAL, tmpVec.set(0, 0, t.z));
    d.offset.set(0, 0, 0);
    if (e.ray.intersectPlane(d.plane, tmpPlaneHit)) {
      d.offset.set(t.x - tmpPlaneHit.x, t.y - tmpPlaneHit.y, 0);
    }
    d.target.set(t.x, t.y, t.z);
    hoverRef.current = true;
    setCursor(true, 'TOSS');
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerId !== drag.current.pointerId) return;
    // Read the drag velocity (and throw) *before* dropping the capture:
    // releasePointerCapture can dispatch lostpointercapture synchronously,
    // which would otherwise end the drag first and flush the velocity.
    endDrag(true);
    try {
      captureApi(e).releasePointerCapture?.(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const onClick = () => {
    // A drag that ends on the card must not count as "click to forge".
    if (drag.current.travel > DRAG_THRESHOLD) return;
    onSelect();
  };

  useFrame((state, delta) => {
    const body = rigidRef.current;
    if (!body) return;

    const t = body.translation();
    const { w, h } = bounds.current;
    const maxX = Math.max(0.15, w / 2 - HALF_W - 0.05);
    const maxY = Math.max(0.15, h / 2 - HALF_H - 0.05);

    if (!spawned.current) {
      // Seeded from the live viewport so a phone and a desktop both start with
      // every card inside the frame.
      body.setTranslation(
        {
          x: spawn.rx * Math.max(0.2, w - CARD_W - 0.4),
          y: h / 2 - HALF_H - 0.25 - spawn.ry * Math.max(0.4, h - CARD_H - 1.0),
          z: spawn.rz * 0.5,
        },
        true
      );
      body.setAngvel({ x: 0, y: 0, z: (spawn.rz || 0.3) * 1.2 }, true);
      spawned.current = true;
    }

    const d = drag.current;
    if (d.active) {
      // Velocity-driven drag: the body stays dynamic, so a dragged slab still
      // shoves its neighbours around instead of tunnelling through them.
      const k = 16;
      const vx = THREE.MathUtils.clamp((d.target.x - t.x) * k, -22, 22);
      const vy = THREE.MathUtils.clamp((d.target.y - t.y) * k, -22, 22);
      body.setLinvel({ x: vx, y: vy, z: (d.target.z - t.z) * 8 }, true);
      const av = body.angvel();
      body.setAngvel({ x: av.x * 0.86, y: av.y * 0.86, z: av.z * 0.9 }, true);
    }

    // Safety net: clamp anything that escapes (resize, solver pop, deep pile).
    let nx = t.x;
    let ny = t.y;
    if (nx > maxX) nx = maxX;
    else if (nx < -maxX) nx = -maxX;
    if (ny > maxY) ny = maxY;
    else if (ny < -maxY) ny = -maxY;
    if (nx !== t.x || ny !== t.y) {
      const v = body.linvel();
      body.setTranslation({ x: nx, y: ny, z: t.z }, true);
      body.setLinvel(
        {
          x: nx === maxX ? Math.min(v.x, 0) : nx === -maxX ? Math.max(v.x, 0) : v.x,
          y: ny === maxY ? Math.min(v.y, 0) : ny === -maxY ? Math.max(v.y, 0) : v.y,
          z: v.z,
        },
        true
      );
    }

    tiltTarget(tilt.current, pointerUv.current.x, pointerUv.current.y);
    updateHoloMaterial(materialRef.current, {
      time: state.clock.elapsedTime + index,
      delta,
      finish: finishIndex(finish),
      // Hover emphasis lives in the shader (not in a mesh scale) so the visual
      // and the collider stay the same object at the same size.
      intensity: d.active ? 1.8 : hoverRef.current ? 1.5 : 1,
      texture,
      pointer: pointerUv.current,
      tilt: tilt.current,
      init: finishInit,
    });
  });

  return (
    <RigidBody
      ref={rigidRef}
      colliders={false}
      linearDamping={1.8}
      angularDamping={1.2}
      mass={0.6}
      restitution={0.7}
      friction={0.5}
      canSleep={false}
      position={[0, 0, 0]}
    >
      <CuboidCollider args={[HALF_W, HALF_H, HALF_D]} />
      <mesh
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => endDrag(false)}
        onLostPointerCapture={() => endDrag(false)}
        onPointerEnter={() => {
          hoverRef.current = true;
          setCursor(true, 'TOSS');
        }}
        onPointerLeave={() => {
          if (drag.current.active) return;
          hoverRef.current = false;
          pointerUv.current.set(0.5, 0.5);
          setCursor(false);
        }}
        onClick={onClick}
      >
        <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
        <holoShaderMaterial
          ref={materialRef}
          uImage={texture}
          uCardAspect={CARD_ASPECT}
        />
      </mesh>
    </RigidBody>
  );
}

function Walls() {
  // Walls track the viewport: inner faces sit exactly on the visible edge, so
  // cards can never settle outside the frame on a narrow screen.
  const viewport = useThree((s) => s.viewport);
  const hx = viewport.width / 2;
  const hy = viewport.height / 2;
  const T = 0.6;

  return (
    <>
      <RigidBody type="fixed" position={[0, -hy - T, 0]}><CuboidCollider args={[hx + T * 2, T, 4]} /></RigidBody>
      <RigidBody type="fixed" position={[0, hy + T, 0]}><CuboidCollider args={[hx + T * 2, T, 4]} /></RigidBody>
      <RigidBody type="fixed" position={[-hx - T, 0, 0]}><CuboidCollider args={[T, hy + T * 2, 4]} /></RigidBody>
      <RigidBody type="fixed" position={[hx + T, 0, 0]}><CuboidCollider args={[T, hy + T * 2, 4]} /></RigidBody>
      <RigidBody type="fixed" position={[0, 0, -1.0]}><CuboidCollider args={[hx + T, hy + T, 0.5]} /></RigidBody>
      <RigidBody type="fixed" position={[0, 0, 1.0]}><CuboidCollider args={[hx + T, hy + T, 0.5]} /></RigidBody>
    </>
  );
}

function Scene({ cards }: { cards: typeof galleryData }) {
  // Deterministic per card (no Math.random during render): a resize or a
  // filter change must not reshuffle the pile.
  const seeds = useMemo<Spawn[]>(
    () => cards.map((card, i) => ({ ...hashSeed(`${card.id}:${i}`) })),
    [cards]
  );

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#FF4D00" />
      <Physics gravity={[0, -1.5, 0]}>
        <Walls />
        {cards.map((card, i) => (
          <Card
            key={card.id}
            image={card.image}
            finish={card.style}
            spawn={seeds[i] ?? { rx: 0, ry: 0.5, rz: 0 }}
            index={i}
            onSelect={() => {
              document.getElementById('forge')?.scrollIntoView({ behavior: 'smooth' });
              sounds.success();
            }}
          />
        ))}
      </Physics>
    </>
  );
}

export default function GalleryPitPhysics({ cards }: { cards: typeof galleryData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount on the next frame: the canvas swap (0 -> 70vh placeholder -> 75vh
    // canvas) has to land before ScrollTrigger measures the page, otherwise
    // every trigger below the pit keeps the old (shorter) document height.
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[70vh] bg-[#050505] border border-[#1A1A1A] grid place-items-center">
        <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/30">INITIALIZING RAPIER • LOADING PHYSICS...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[75vh] relative border border-[#1A1A1A] bg-[#050505] overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        // pan-y: a sideways flick drags a card, an upright swipe still scrolls
        // the page. touch-action:none here would trap the page on mobile.
        style={{ touchAction: 'pan-y' }}
      >
        <Scene cards={cards} />
      </Canvas>

      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between pointer-events-none">
        <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/60 bg-black/70 px-3 py-1.5 border border-white/10 backdrop-blur">
          RAPIER PHYSICS • {cards.length} SLABS • MASS 0.6 • RESTITUTION 0.7
        </div>
        <div className="font-mono text-[10px] text-[#FF4D00] bg-black/70 px-3 py-1.5 border border-[#FF4D00]/30 backdrop-blur animate-pulse">
          ● DRAG • TOSS • COLLIDE • CLICK → FORGE
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="flex justify-between font-mono text-[9px] text-[#F5F3EF]/40">
          <span>Each card is a RigidBody with CuboidCollider • Walls seal to the viewport</span>
          <span className="text-[#F5F3EF]/60">Drag to toss a slab • Click to forge one like it</span>
        </div>
      </div>
    </div>
  );
}
