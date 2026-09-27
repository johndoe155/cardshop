'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { galleryData } from '@/data/gallery';
import { useVaultStore } from '@/store/useVaultStore';
import { sounds } from '@/lib/sounds';

export function MarqueeGallery() {
  const { setCursor } = useVaultStore();
  const sectionRef = useRef<HTMLElement>(null);

  // One restrained entrance for the strip (header line drops in, track rises),
  // fired once. The marquee's own motion carries the section after that —
  // per-card staggering would fight the scroll and read templated.
  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo('.marquee-head',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', once: true } }
      );
      gsap.fromTo('.marquee-track',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true } }
        );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-6 border-y border-[#1A1A1A] overflow-hidden bg-[#0a0a0a]">
      <div className="marquee-head flex items-center gap-4 px-6 md:px-12 mb-6">
        <div className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">RECENT FORGES • LIVE FROM THE VAULT</div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FF4D00]/50 to-transparent" />
        <div className="font-mono text-[10px] text-[#F5F3EF]/30 tabular">{galleryData.length} SLABS • 2023–2024</div>
      </div>

      <div className="marquee-track">
        {[...Array(2)].map((_, dup) => (
          <div key={dup} className="flex gap-4 pr-4">
            {galleryData.map((card) => (
              <div
                key={`${dup}-${card.id}`}
                className="group relative w-[200px] md:w-[240px] shrink-0 cursor-none"
                onMouseEnter={() => {
                  setCursor(true, 'VIEW');
                  sounds.hover();
                }}
                onMouseLeave={() => setCursor(false)}
                onClick={() => {
                  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                  sounds.click();
                }}
              >
                <div className="slab-frame aspect-[3/4] bg-[#111]">
                  <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-2">
                    <span className="font-mono text-[8px] px-1.5 py-0.5 bg-[#FF4D00] text-white">{card.style.toUpperCase()}</span>
                    <span className="font-mono text-[8px] text-white/50">{card.id}</span>
                  </div>
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="font-bold text-[12px] leading-tight truncate">{card.name}</div>
                    <div className="font-mono text-[9px] text-white/50 truncate">{card.collection}</div>
                  </div>
                  {/* Holo overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
                    style={{ background: `linear-gradient(105deg, transparent 20%, rgba(255,77,0,0.3), rgba(0,229,255,0.3), transparent 80%)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
