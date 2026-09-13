'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Preloader } from '@/components/Preloader';
import { Hero } from '@/components/Hero';
import { MarqueeGallery } from '@/components/MarqueeGallery';
import { Gallery } from '@/components/Gallery';
import { HowItWorks } from '@/components/HowItWorks';
import { Forge } from '@/components/Forge';
import { Partnerships } from '@/components/Partnerships';
import { About } from '@/components/About';
import { OrderStatus } from '@/components/OrderStatus';
import { Footer } from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Scroll progress bar
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;
    
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? scrollTop / docHeight : 0;
      gsap.to(progress, { scaleX: p, duration: 0.3, ease: 'power2.out' });
    };
    
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative w-full">
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      <div className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}>
        <Navbar />
        <Hero />
        <MarqueeGallery />
        <Gallery />
        <HowItWorks />
        <Forge />
        <Partnerships />
        <About />
        <OrderStatus />
        <Footer />

        {/* FAQ Quick */}
        <section className="py-12 px-6 md:px-12 xl:px-24 bg-[#050505] border-t border-[#1A1A1A]">
          <div className="max-w-[1600px] mx-auto flex flex-wrap gap-8 font-mono text-[10px] leading-relaxed">
            <div className="flex-1 min-w-[240px]">
              <div className="text-[#F5F3EF]/30 mb-2">FAQ • OWNERSHIP</div>
              <div className="text-[#F5F3EF]/60">We verify via Alchemy read-only. You must own the NFT or have rights. No custody of keys, ever. IP disclaimer in Terms.</div>
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="text-[#F5F3EF]/30 mb-2">SHIPPING</div>
              <div className="text-[#F5F3EF]/60">US $8 • Intl $18 • Free over $200. 7-12 day production, then carrier. Tracking via Shippo mock.</div>
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="text-[#F5F3EF]/30 mb-2">RETURNS</div>
              <div className="text-[#F5F3EF]/60">Made-to-order = non-refundable after production starts. Defects? Free reprint, no questions.</div>
            </div>
          </div>
        </section>
      </div>

      {/* Konami easter egg */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          let code = [];
          const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
          window.addEventListener('keydown', (e) => {
            code.push(e.key);
            code = code.slice(-10);
            if (code.join(',') === konami.join(',')) {
              document.body.style.filter = 'hue-rotate(90deg)';
              setTimeout(() => document.body.style.filter = '', 3000);
              const el = document.createElement('div');
              el.textContent = 'HOLO MODE ACTIVATED • ALL SLABS ARE NOW RAINBOW';
              el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#FF4D00;color:white;padding:12px 24px;font-family:monospace;font-size:12px;z-index:99999;';
              document.body.appendChild(el);
              setTimeout(() => el.remove(), 3000);
            }
          });
        })();
      `}} />
    </main>
  );
}
