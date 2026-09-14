'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { MagneticButton } from './ui/MagneticButton';
import { useVaultStore } from '@/store/useVaultStore';
import { sounds } from '@/lib/sounds';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { setCursor } = useVaultStore();

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    const ctx = gsap.context(() => {
      // SplitType for title
      const split = new SplitType(titleRef.current!, { types: 'lines,words,chars', tagName: 'span' });

      // FIX: SplitType wraps each line in a display:block container so it can
      // animate characters independently. Chrome will not paint a
      // background-clip:text gradient once its text sits inside a block-level
      // descendant, which made the "foil-text" (rainbow) "Form." invisible.
      // Restore that word to plain text (its original, unsplit markup) so the
      // gradient/sweep renders exactly as authored in .foil-text / @keyframes
      // foilShift, and animate it in as a single unit instead of per-character.
      const foilEl = titleRef.current!.querySelector('.foil-text') as HTMLElement | null;
      const allChars = split.chars || [];
      const chars = foilEl ? allChars.filter((c) => !foilEl.contains(c)) : allChars;
      if (foilEl) {
        foilEl.textContent = 'Form.';
        gsap.set(foilEl, { y: '110%', opacity: 0 });
      }

      if (chars.length > 0) {
        gsap.set(chars, { y: '110%', opacity: 0, rotateX: -30 });
      }

      gsap.to(chars, {
        y: '0%',
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        stagger: { amount: 0.8, from: 'start' },
        ease: 'power4.out',
        delay: 0.6,
      });

      if (foilEl) {
        gsap.to(foilEl, {
          y: '0%',
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.6 + 0.8, // lands right as the last staggered character arrives
        });
      }

      // Words for subtitle
      const desc = document.querySelector('.hero-desc') as HTMLElement;
      if (desc) {
        const descSplit = new SplitType(desc, { types: 'lines' });
        gsap.fromTo(descSplit.lines,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 1.2 }
        );
      }

      // Parallax
      gsap.to('.hero-bg-text', {
        yPercent: -40,
        rotate: -2,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=100%',
          scrub: 1.2,
        }
      });

      gsap.to('.hero-card-hint', {
        opacity: 0,
        y: -30,
        scale: 0.9,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=30%',
          scrub: true,
        }
      });

      // Magnetic specs
      gsap.fromTo('.hero-specs div',
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 1.5 }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    sounds.click();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[100vh] w-full flex flex-col justify-center px-6 md:px-12 xl:px-24 pt-24 pb-12 overflow-hidden">
      <div className="hero-bg-text absolute top-[12%] left-0 right-0 pointer-events-none select-none opacity-[0.04] font-black text-[32vw] leading-none tracking-tighter text-center will-change-transform">
        NEMO
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      <div className="relative z-10 max-w-[1600px] w-full mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-[#FF4D00]" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">EST. 2023 • 2,847 SLABS FORGED • TRUE WEBGL</span>
            <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse" />
          </div>

          <h1 ref={titleRef} className="hero-title font-display font-black text-[12vw] md:text-[10vw] lg:text-[8.5vw] leading-[0.85] tracking-[-0.04em] uppercase overflow-hidden">
            Digital<br/>
            <span className="font-light italic lowercase tracking-tight">soul,</span><br/>
            <span className="text-[#F5F3EF]/10">Physical</span><br/>
            <span className="foil-text">Form.</span>
          </h1>

          <div className="mt-10 max-w-[420px]">
            <p className="hero-desc font-body text-[16px] md:text-[18px] leading-[1.5] text-[#F5F3EF]/70">
              We turn your NFTs into museum-grade physical slabs. Cracked ice, holo foil, vault-sealed. 
              <span className="text-[#F5F3EF] font-medium"> Not merch. Artifacts.</span> Now with Rapier physics and true GLSL.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton size="lg" onClick={() => scrollTo('forge')}>
                Commission a Card — $49
                <span className="ml-2">→</span>
              </MagneticButton>
              <button
                onClick={() => scrollTo('gallery')}
                onMouseEnter={() => setCursor(true, 'PHYSICS')}
                onMouseLeave={() => setCursor(false)}
                className="h-14 px-8 border border-[#2A2A2A] text-[12px] font-bold tracking-widest uppercase text-[#F5F3EF]/60 hover:text-[#F5F3EF] hover:border-[#FF4D00]/50 transition-colors cursor-none group"
              >
                <span className="flex items-center gap-2">
                  Enter Pit (Rapier)
                  <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full group-hover:animate-ping" />
                </span>
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6 border-t border-[#1A1A1A] pt-6">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#080808] grid place-items-center font-mono text-[10px]">◍</div>
                ))}
              </div>
              <div className="font-mono text-[11px] leading-tight">
                <div className="text-[#F5F3EF]">Trusted by 12 NFT communities • Physics pit live</div>
                <div className="text-[#F5F3EF]/40">Ape Reunion • Kanpai • Chimpers • 2,847 slabs</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative lg:h-[80vh] hidden lg:flex items-center justify-center">
          <div className="hero-card-hint absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[320px] h-[440px] border border-dashed border-[#F5F3EF]/10 grid place-items-center relative">
              <span className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/20 rotate-90">INTERACTIVE • DRAG TO ROTATE • WEBGL</span>
              <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-[#FF4D00]/30" />
              <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-[#FF4D00]/30" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-[#FF4D00]/30" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-[#FF4D00]/30" />
            </div>
          </div>
          
          <div className="hero-specs absolute bottom-12 right-0 font-mono text-[10px] leading-relaxed text-[#F5F3EF]/30 text-right">
            <div>MODEL: NMO-VAULT-01 • RAPIER</div>
            <div>FINISH: HOLO • 1/1 • GLSL</div>
            <div>MATERIAL: OPTICAL GRADE • 120G</div>
            <div className="text-[#FF4D00] mt-2 flex items-center justify-end gap-2">
              <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
              LIVE SHADER • PHYSICS • 60FPS
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-y border-[#1A1A1A] bg-[#0a0a0a]/80 backdrop-blur">
        <div className="marquee-track py-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              {[
                'BASE $49', 'HOLO $79', 'CRACKED ICE $99', 'GOLD $129',
                'RAPIER PHYSICS • LIVE', 'TRUE WEBGL • GLSL', 'WORLDWIDE SHIPPING', '7-12 DAY PRODUCTION',
                'BASE $49', 'HOLO $79', 'CRACKED ICE $99', 'GOLD $129',
              ].map((txt, j) => (
                <span key={j} className="flex items-center gap-8 font-mono text-[11px] tracking-widest whitespace-nowrap">
                  <span className="text-[#F5F3EF]/60">{txt}</span>
                  <span className="w-1 h-1 bg-[#FF4D00] rounded-full" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
