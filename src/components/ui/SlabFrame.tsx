'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useVaultStore } from '@/store/useVaultStore';
import { sounds } from '@/lib/sounds';

export function SlabFrame({ 
  children, 
  className = '',
  label = 'NEMO • GRADED',
  foil = false,
  interactive = false,
}: { 
  children: React.ReactNode; 
  className?: string;
  label?: string;
  foil?: boolean;
  interactive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { setCursor } = useVaultStore();

  useEffect(() => {
    if (!interactive || !ref.current) return;
    const el = ref.current;
    
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      gsap.to(el, {
        '--mx': `${x * 100}%`,
        '--my': `${y * 100}%`,
        duration: 0.6,
        ease: 'power3.out',
      } as any);
      
      gsap.to(el, {
        rotateX: (0.5 - y) * 8,
        rotateY: (x - 0.5) * 12,
        duration: 0.8,
        ease: 'power3.out',
        transformPerspective: 1000,
      });
    };
    
    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
      });
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [interactive]);

  return (
    <div
      ref={ref}
      className={`slab-frame group relative ${interactive ? 'cursor-none' : ''} ${className}`}
      style={{ 
        // @ts-ignore
        '--mx': '50%', '--my': '50%',
        transformStyle: 'preserve-3d',
      } as any}
      onMouseEnter={() => {
        if (interactive) {
          setCursor(true, 'VIEW');
          sounds.foil();
        }
      }}
      onMouseLeave={() => interactive && setCursor(false)}
    >
      {/* Top label */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-[#2a2a2a]">
        <span className="font-mono text-[9px] tracking-[0.2em] text-[#F5F3EF]/60 uppercase">{label}</span>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-[#FF4D00] animate-pulse" />
          <span className="font-mono text-[9px] tracking-widest text-[#F5F3EF]/40">PSA 10 • GEM MINT</span>
        </div>
      </div>
      
      {/* Foil edge highlight */}
      {foil && (
        <div 
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mx) var(--my), rgba(255,77,0,0.15), rgba(0,229,255,0.1) 20%, transparent 80%)`,
          }}
        />
      )}
      
      <div className="relative z-10 pt-8">
        {children}
      </div>
      
      {/* Bottom grade */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4D00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
