'use client';
import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVaultStore } from '@/store/useVaultStore';
import { initSounds, sounds } from '@/lib/sounds';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { setScrollProgress, setPointer, setAudioEnabled, setFinishType } = useVaultStore();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [nemoActive, setNemoActive] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: any) => {
      setScrollProgress(e.progress);
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const onPointerMove = (e: PointerEvent) => {
      setPointer(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
      
      // Reset idle timer
      setNemoActive(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setNemoActive(true);
      }, 10000); // 10s idle
    };
    window.addEventListener('pointermove', onPointerMove);

    const onFirstInteraction = () => {
      initSounds();
      setAudioEnabled(true);
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);

    // Konami code + full holo mode
    let code: string[] = [];
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    const onKeyDown = (e: KeyboardEvent) => {
      code.push(e.key);
      code = code.slice(-10);
      if (code.join(',') === konami.join(',')) {
        // Full holo mode
        setFinishType('holo');
        document.body.style.filter = 'hue-rotate(0deg)';
        sounds.success();
        
        // Make all cards holo visually
        const slabs = document.querySelectorAll('.slab-frame');
        slabs.forEach((slab: any) => {
          slab.style.filter = 'hue-rotate(90deg) saturate(1.5)';
          slab.style.transition = 'filter 0.5s';
        });
        
        // Show banner
        const banner = document.createElement('div');
        banner.innerHTML = `
          <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#FF4D00;color:white;padding:20px 32px;font-family:monospace;font-size:14px;z-index:99999;border:2px solid white;box-shadow:0 0 40px rgba(255,77,0,0.5);text-align:center;">
            <div style="font-weight:bold;font-size:18px;margin-bottom:8px;">🌈 HOLO MODE ACTIVATED 🌈</div>
            <div>All slabs are now rainbow foil • Rapier gravity inverted • Nemo is dancing</div>
            <div style="margin-top:8px;font-size:10px;opacity:0.8;">Press ESC to exit • Konami code forever</div>
          </div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 4000);
        
        // Invert gravity effect
        gsap.to('body', {
          filter: 'hue-rotate(180deg)',
          duration: 0.5,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            document.body.style.filter = '';
            slabs.forEach((slab: any) => slab.style.filter = '');
          }
        });
      }
      
      if (e.key === 'Escape') {
        document.body.style.filter = '';
        document.querySelectorAll('.slab-frame').forEach((slab: any) => slab.style.filter = '');
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Initial idle timer
    idleTimerRef.current = setTimeout(() => setNemoActive(true), 10000);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.removeEventListener('keydown', onKeyDown);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return (
    <>
      {children}
      {/* Nemo idle follower */}
      <div className={`fixed pointer-events-none z-[9999] transition-opacity duration-1000 ${nemoActive ? 'opacity-100' : 'opacity-0'}`} id="nemo-follower">
        <div className="w-12 h-12 bg-[#FF4D00] rounded-full grid place-items-center font-black text-white animate-bounce border-2 border-white shadow-[0_0_20px_rgba(255,77,0,0.5)]">
          N
        </div>
        <div className="mt-1 font-mono text-[8px] tracking-widest bg-black text-white px-1 py-0.5 border border-white/20 whitespace-nowrap">
          NEMO • IDLE • FOLLOWING
        </div>
      </div>
    </>
  );
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const nemoRef = useRef<HTMLDivElement>(null);
  const { cursorHover, cursorLabel } = useVaultStore();
  const mouse = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });
  const nemoPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      
      // Nemo follower
      const nemoEl = document.getElementById('nemo-follower') as HTMLElement;
      if (nemoEl) {
        // Lag behind cursor
        gsap.to(nemoEl, {
          x: e.clientX + 20,
          y: e.clientY + 20,
          duration: 1.2,
          ease: 'power3.out',
        });
      }
    };
    window.addEventListener('mousemove', onMove);

    let raf: number;
    const animate = () => {
      followerPos.current.x += (mouse.current.x - followerPos.current.x) * 0.12;
      followerPos.current.y += (mouse.current.y - followerPos.current.y) * 0.12;
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className={`custom-cursor ${cursorHover ? 'hover' : ''}`} data-label={cursorLabel} />
      <div ref={followerRef} className="custom-cursor-follower" style={{
        width: cursorHover ? '48px' : '32px',
        height: cursorHover ? '48px' : '32px',
        borderColor: cursorHover ? 'rgba(255,77,0,0.5)' : 'rgba(245,243,239,0.2)'
      }} />
    </>
  );
}
