'use client';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 12;
      });
    }, 80);

    // GSAP intro
    gsap.fromTo(textRef.current?.children || [], 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'power4.out', delay: 0.2 }
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const tl = gsap.timeline({ onComplete });
      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut',
      });
    }
  }, [progress, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-[#080808] flex flex-col items-center justify-center">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      <div ref={textRef} className="relative z-10 text-center">
        {/* Logo stamp animation with real assets */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 border border-[#FF4D00] bg-[#F5F3EF] grid place-items-center p-3 animate-pulse">
              <img src="/logo-mark.svg" alt="Nemo's" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#FF4D00]" />
            <img src="/mascot/stamping.png" alt="Nemo stamping" className="absolute -top-8 -right-12 w-16 h-16 object-contain rotate-12 hidden md:block" />
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex justify-center mb-4">
            <img src="/logo-wordmark.svg" alt="Nemo's Card Shop" className="h-12 md:h-16 invert" />
          </div>
          <h1 className="font-display font-black text-[14vw] md:text-[10vw] leading-[0.85] tracking-tighter text-[#F5F3EF]">
            <span className="block">NEMO'S</span>
            <span className="block font-light italic">VAULT</span>
          </h1>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 overflow-hidden">
          <div className="h-[1px] w-12 bg-[#FF4D00]" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#F5F3EF]/50">FORGING PHYSICAL GRAILS</span>
          <div className="h-[1px] w-12 bg-[#FF4D00]" />
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
        <div className="font-mono text-[10px] text-[#F5F3EF]/30">
          LOADING ASSETS • {Math.min(100, Math.floor(progress))}%<br/>
          <span className="text-[#FF4D00]">SHADERS • TEXTURES • PHYSICS</span>
        </div>
        <div className="w-48 h-[2px] bg-[#1A1A1A] overflow-hidden">
          <div className="h-full bg-[#FF4D00] transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Corner marks */}
      <div className="absolute top-8 left-8 w-4 h-4 border-l border-t border-[#F5F3EF]/20" />
      <div className="absolute top-8 right-8 w-4 h-4 border-r border-t border-[#F5F3EF]/20" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-l border-b border-[#F5F3EF]/20" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-r border-b border-[#F5F3EF]/20" />
    </div>
  );
}
