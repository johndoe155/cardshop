'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function Footer() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctaRef.current) return;
    
    const ctx = gsap.context(() => {
      // Watermark parallax
      gsap.to(watermarkRef.current, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });

      // CTA magnetic
      const cta = ctaRef.current;
      if (!cta) return;
      
      const xTo = gsap.quickTo(cta, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(cta, 'y', { duration: 0.6, ease: 'power3' });
      
      const onMove = (e: MouseEvent) => {
        const rect = cta.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(x*x + y*y);
        if (dist < 400) {
          xTo(x * 0.15);
          yTo(y * 0.15);
        }
      };
      
      window.addEventListener('mousemove', onMove);
      return () => window.removeEventListener('mousemove', onMove);
    }, ctaRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <footer className="relative bg-[#050505] border-t border-[#1A1A1A] px-6 md:px-12 xl:px-24 py-16 md:py-24 overflow-hidden">
      {/* Physics CTA Banner */}
      <div ref={ctaRef} className="max-w-[1600px] mx-auto mb-16 border border-[#FF4D00]/20 bg-[#FF4D00]/5 p-8 md:p-12 relative overflow-hidden group hover:border-[#FF4D00]/40 transition-colors cursor-pointer">
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,77,0,0.1) 10px, rgba(255,77,0,0.1) 11px)`
          }} />
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF4D00] rounded-full animate-pulse" />
              PHYSICS HOVER • MAGNETIC • TRY MOVING CURSOR CLOSE
            </div>
            <div className="font-display font-black text-[32px] md:text-[48px] leading-[0.9] tracking-tighter uppercase">
              Ready To<br/>
              <span className="foil-text">Forge Yours?</span>
            </div>
            <div className="font-mono text-[11px] text-[#F5F3EF]/50 mt-3">
              True WebGL • Rapier Physics • GLSL Shaders • 60FPS • 2,847 slabs and counting
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right font-mono text-[10px] leading-relaxed text-[#F5F3EF]/30">
              <div>MODEL: NMO-VAULT-01</div>
              <div>FINISH: ALL • PHYSICS: RAPIER</div>
              <div className="text-[#FF4D00]">● LIVE • INTERACTIVE</div>
            </div>
            <div className="w-20 h-20 bg-[#FF4D00] rounded-full grid place-items-center font-black text-2xl text-white group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              →
            </div>
          </div>
        </div>

        {/* Floating orbs for physics feel */}
        <div className="absolute top-4 right-20 w-2 h-2 bg-[#FF4D00]/30 rounded-full animate-[float_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 right-40 w-1 h-1 bg-[#00E5FF]/50 rounded-full animate-[float_4s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-12 left-1/2 w-1.5 h-1.5 bg-[#FFE600]/40 rounded-full animate-[float_3.5s_ease-in-out_infinite_1s]" />
      </div>

      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#F5F3EF] p-2 grid place-items-center">
                <img src="/logo-mark.svg" alt="Nemo's" className="w-full h-full object-contain" />
              </div>
              <div className="leading-none">
                <img src="/logo-wordmark.svg" alt="NEMO'S CARD SHOP" className="h-6 invert mb-1" />
                <div className="font-mono text-[9px] tracking-[0.2em] opacity-60">DIGITAL SOUL • PHYSICAL FORM • REAL BRAND</div>
              </div>
            </div>
            <p className="font-body text-[13px] leading-relaxed text-[#F5F3EF]/50 max-w-[320px]">
              Turning NFTs into museum-grade slabs since 2023. Now with Rapier physics, true GLSL, and Nemo that follows you when idle. Not affiliated with PSA, but we have better foil and better physics.
            </p>
            <div className="mt-6 flex gap-2">
              <a href="https://x.com/nemoscardshop" target="_blank" className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center font-mono text-[10px] hover:border-[#FF4D00]/50 hover:text-[#FF4D00] transition-colors">X</a>
              <a href="#" className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center font-mono text-[10px] hover:border-[#FF4D00]/50 hover:text-[#FF4D00] transition-colors">IG</a>
              <a href="#" className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center font-mono text-[10px] hover:border-[#FF4D00]/50 hover:text-[#FF4D00] transition-colors">DC</a>
              <a href="#" className="w-8 h-8 bg-[#FF4D00] border border-[#FF4D00] grid place-items-center font-mono text-[10px] text-white hover:scale-110 transition-transform">GH</a>
            </div>

            <div className="mt-6 p-3 bg-[#111] border border-[#1A1A1A]">
              <div className="font-mono text-[9px] tracking-widest text-[#F5F3EF]/30">TECH STACK • 100% AWWWARDS</div>
              <div className="font-mono text-[10px] text-[#F5F3EF]/60 mt-1 leading-relaxed">
                Next.js 16 • R3F • Rapier • GLSL • Lenis • GSAP • SplitType • Zustand • Maath • Howler
              </div>
            </div>
          </div>

          {[
            { title: 'Shop • Physics', links: ['Commission (WebGL)', 'Gallery (Rapier Pit)', 'Drops', 'Partnerships'] },
            { title: 'Support • Live', links: ['How It Works (SVG)', 'Order Status', 'FAQ', 'Contact • Nemo DMs'] },
            { title: 'Legal • Trust', links: ['Terms • IP Policy', 'Privacy • No Keys', 'Shipping • Shippo', 'Returns • 0.8% defect'] },
          ].map(col => (
            <div key={col.title}>
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#F5F3EF]/30 mb-4 uppercase">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="font-body text-[13px] text-[#F5F3EF]/60 hover:text-[#F5F3EF] hover:translate-x-1 inline-block transition-all">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#1A1A1A] flex flex-wrap items-center justify-between gap-4">
          <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/20">
            ©2024 NEMO'S CARD SHOP • BUILT IN THE VAULT • OHIO + INTERNET • PHYSICS • GLSL • 60FPS
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-[#F5F3EF]/20">
            <span className="flex items-center gap-1"><span className="w-1 h-1 bg-[#00FF00] rounded-full animate-pulse" /> 2,847 SLABS FORGED</span>
            <span className="w-1 h-1 bg-[#2A2A2A] rounded-full" />
            <span>RAPIER • TRUE WEBGL</span>
            <span className="w-1 h-1 bg-[#FF4D00] rounded-full animate-pulse" />
            <span>KONAMI → HOLO</span>
          </div>
        </div>

        <div ref={watermarkRef} className="mt-12 font-display font-black text-[18vw] leading-none tracking-tighter text-[#F5F3EF]/[0.02] select-none pointer-events-none uppercase text-center will-change-transform">
          Nemo's Vault
        </div>

        <div className="mt-4 text-center font-mono text-[9px] tracking-[0.2em] text-[#F5F3EF]/10">
          PHYSICS HOVER THE BANNER ABOVE • WAIT 10S IDLE FOR NEMO FOLLOWER • KONAMI CODE FOR HOLO MODE • DRAG GALLERY CARDS • WEBGL FORGE PREVIEW • SVG LINE DRAWING
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </footer>
  );
}
