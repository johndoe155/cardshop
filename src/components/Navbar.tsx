'use client';
import { useEffect, useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { MagneticButton } from './ui/MagneticButton';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setCursor } = useVaultStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between p-4 md:p-6">
          {/* Logo */}
          <div 
            className="pointer-events-auto flex items-center gap-3 group cursor-none"
            onMouseEnter={() => setCursor(true, 'HOME')}
            onMouseLeave={() => setCursor(false)}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-[#F5F3EF] text-black grid place-items-center font-black text-[14px] tracking-tighter leading-none">
              N
              <span className="text-[8px] -mt-1">MØ</span>
            </div>
            <div className="hidden md:block leading-none">
              <div className="font-display font-black text-[16px] tracking-tight">NEMO'S</div>
              <div className="font-mono text-[9px] tracking-[0.2em] opacity-60 -mt-1">CARD SHOP • EST 2023</div>
            </div>
          </div>

          {/* Center nav - desktop */}
          <nav className={`hidden lg:flex items-center gap-1 pointer-events-auto p-1 rounded-full transition-all duration-500 ${scrolled ? 'bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#2A2A2A]' : 'bg-transparent'}`}>
            {[
              { label: 'Gallery', id: 'gallery' },
              { label: 'How It Works', id: 'how' },
              { label: 'Forge', id: 'forge' },
              { label: 'Partnerships', id: 'partnerships' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase text-[#F5F3EF]/70 hover:text-[#F5F3EF] hover:bg-white/5 rounded-full transition-colors cursor-none"
                onMouseEnter={() => setCursor(true, 'GO')}
                onMouseLeave={() => setCursor(false)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button 
              onClick={() => scrollTo('status')}
              className="hidden md:flex w-10 h-10 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F3EF] items-center justify-center font-mono text-[10px] hover:border-[#FF4D00]/50 transition-colors cursor-none"
              onMouseEnter={() => setCursor(true, 'TRACK')}
              onMouseLeave={() => setCursor(false)}
            >
              ◍
            </button>
            <div className="relative">
              <MagneticButton variant="light" size="sm" onClick={() => scrollTo('forge')}>
                Commission
                {cartCount > 0 && <span className="ml-2 w-5 h-5 bg-[#FF4D00] text-white rounded-full grid place-items-center text-[10px]">{cartCount}</span>}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical rails */}
      <div className="fixed left-0 top-0 bottom-0 z-40 hidden xl:flex flex-col justify-between py-24 px-4 pointer-events-none">
        <div className="vertical-rail">SCROLL — EXPLORE THE VAULT</div>
        <div className="vertical-rail">DIGITAL SOUL • PHYSICAL FORM</div>
      </div>
      <div className="fixed right-0 top-0 bottom-0 z-40 hidden xl:flex flex-col justify-between py-24 px-4 pointer-events-none">
        <div className="vertical-rail">NEMO'S CARD SHOP ©2024</div>
        <div className="vertical-rail">BUILT FOR COLLECTORS • BY COLLECTORS</div>
      </div>
    </>
  );
}
