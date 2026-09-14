'use client';
import { SlabFrame } from './ui/SlabFrame';

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 px-6 md:px-12 xl:px-24 bg-[#080808]">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12 md:gap-24 items-start">
        <div className="lg:sticky lg:top-32">
          <SlabFrame label="FOUNDER • NEMO • @heyitsnemo_" foil>
            <div className="aspect-[4/5] bg-[#0a0a0a] relative overflow-hidden">
              <img src="/nemo-mascot.png" alt="Nemo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="font-display font-black text-[32px] leading-none tracking-tighter text-white">NEMO</div>
                <div className="font-mono text-[10px] tracking-widest text-[#FF4D00] mt-1">PENGUIN • BUILDER • COLLECTOR</div>
              </div>
              {/* Sticker */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-[#FF4D00] rounded-full grid place-items-center font-black text-[18px] text-white rotate-12">N</div>
            </div>
          </SlabFrame>
          
          <div className="mt-4 flex gap-2">
            <a href="https://x.com/nemoscardshop" target="_blank" className="flex-1 h-10 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center font-mono text-[10px] tracking-widest hover:border-[#F5F3EF]/20 transition-colors">X / TWITTER →</a>
            <a href="#" className="flex-1 h-10 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center font-mono text-[10px] tracking-widest hover:border-[#F5F3EF]/20 transition-colors">INSTAGRAM →</a>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">05 / ABOUT</span>
            <div className="w-12 h-[1px] bg-[#FF4D00]" />
          </div>
          
          <h2 className="font-display font-black text-[8vw] md:text-[5vw] leading-[0.85] tracking-tighter uppercase">
            Real Person.<br/>
            Real Slabs.<br/>
            <span className="font-light italic lowercase">No VC.</span>
          </h2>

          <div className="mt-12 space-y-6 font-body text-[16px] md:text-[18px] leading-[1.6] text-[#F5F3EF]/70 max-w-[560px]">
            <p className="text-[#F5F3EF] text-[20px] leading-[1.4] font-medium">
              I started Nemo's Card Shop because I wanted my own NFT as a physical card and nobody made one that didn't look like cheap merch.
            </p>
            <p>
              So I learned injection molding, found an optical-grade printer in Ohio, and spent 4 months getting the bevel right. Now 2,847 slabs later, we're here.
            </p>
            <p>
              Every order is still packed by me. Every DM is still answered by me. The mascot is a penguin because penguins are the only animal that looks good in a tux and in a slab.
            </p>
            <div className="pt-6 border-t border-[#1A1A1A]">
              <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/30 mb-3">TRUST SIGNALS</div>
              <ul className="space-y-2 font-mono text-[11px] text-[#F5F3EF]/60">
                <li className="flex gap-2"><span className="text-[#FF4D00]">—</span> No custody of wallets, ever. Read-only verification.</li>
                <li className="flex gap-2"><span className="text-[#FF4D00]">—</span> IP disclaimer: You confirm you own the rights before we print.</li>
                <li className="flex gap-2"><span className="text-[#FF4D00]">—</span> Made-to-order, non-refundable after production starts. Clear policy.</li>
                <li className="flex gap-2"><span className="text-[#FF4D00]">—</span> 2,847 slabs shipped, 0.8% defect rate, free reprint if we mess up.</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-[560px]">
            {[
              { n: '2,847', l: 'Slabs Forged' },
              { n: '12', l: 'Communities' },
              { n: '4.9/5', l: 'Avg Rating' },
            ].map(s => (
              <div key={s.l} className="border border-[#1A1A1A] p-2 sm:p-4 bg-[#0a0a0a]">
                <div className="font-display font-black text-[22px] sm:text-[28px] leading-none tracking-tighter">{s.n}</div>
                <div className="font-mono text-[9px] tracking-widest text-[#F5F3EF]/40 mt-1 uppercase">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
