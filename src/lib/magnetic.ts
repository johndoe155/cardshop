'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Delegated magnetic manager.
 *
 * One document-level pointermove listener drives every registered magnetic
 * element (previously each button mounted its own window listener). Elements
 * register/unregister on mount/unmount; a shared rAF-free quickTo pair per
 * element does the spring easing. Buttons outside any pointer's radius relax
 * back to origin.
 */

interface MagneticEntry {
  el: HTMLElement;
  radius: number;
  strengthX: number;
  strengthY: number;
  xTo: (x: number) => void;
  yTo: (y: number) => void;
}

const registry = new Set<MagneticEntry>();
let listening = false;

function onPointerMove(e: PointerEvent) {
  registry.forEach((entry) => {
    const { el, xTo, yTo } = entry;
    // Skip offscreen elements cheaply
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(x, y);
    if (dist < entry.radius) {
      xTo(x * entry.strengthX);
      yTo(y * entry.strengthY);
    } else {
      xTo(0);
      yTo(0);
    }
  });
}

function ensureListener() {
  if (listening || typeof window === 'undefined') return;
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  listening = true;
}

function dropListener() {
  if (!listening || registry.size > 0 || typeof window === 'undefined') return;
  window.removeEventListener('pointermove', onPointerMove);
  listening = false;
}

export function useMagnetic(options?: {
  radius?: number;
  strengthX?: number;
  strengthY?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // no magnetics on touch

    const entry: MagneticEntry = {
      el,
      radius: opts.current?.radius ?? 200,
      strengthX: opts.current?.strengthX ?? 0.3,
      strengthY: opts.current?.strengthY ?? 0.4,
      xTo: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }),
      yTo: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }),
    };

    const onLeave = () => {
      entry.xTo(0);
      entry.yTo(0);
    };
    el.addEventListener('mouseleave', onLeave);

    registry.add(entry);
    ensureListener();
    return () => {
      registry.delete(entry);
      dropListener();
      el.removeEventListener('mouseleave', onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, []);

  return ref;
}
