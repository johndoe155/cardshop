'use client';
import { MagneticButton } from './ui/MagneticButton';

export function Partnerships() {
  return (
    <section id="partnerships" className="relative py-24 md:py-32 px-6 md:px-12 xl:px-24 bg-[#0a0a0a] border-y border-[#1A1A1A]">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">04 / PARTNERSHIPS</span>
              <div className="w-12 h-[1px] bg-[#FF4D00]" />
            </div>
            <h2 className="font-display font-black text-[10vw] md:text-[6vw] lg:text-[5vw] leading-[0.85] tracking-tighter uppercase">
              For<br/>
              <span className="foil-text">Communities</span><br/>
              Not Just<br/>
              <span className="font-light italic lowercase">Collectors</span>
            </h2>

            <div className="mt-8 space-y-4">
              <div className="p-6 bg-[#111] border border-[#1A1A1A]">
                <div className="font-mono text-[10px] tracking-widest text-[#FF4D00] mb-2">CASE STUDY • APE REUNION</div>
                <div className="font-bold text-[18px] leading-tight">200 slabs • 9 day turnaround • IRL drop in Miami</div>
                <div className="font-body text-[13px] leading-relaxed text-[#F5F3EF]/60 mt-3">
                  "Nemo turned our digital meetup into physical grails. Holders still post them 6 months later. Best community activation we've done." — Ape Reunion Team
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="font-mono text-[9px] px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A]">200 UNITS</span>
                  <span className="font-mono text-[9px] px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A]">CRACKED ICE</span>
                  <span className="font-mono text-[9px] px-2 py-1 bg-[#FF4D00] text-white">SOLD OUT</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: 'Min Order', v: '25 slabs' },
                  { k: 'Discount', v: 'Up to 30%' },
                  { k: 'Turnaround', v: '7-14 days' },
                ].map(s => (
                  <div key={s.k} className="p-3 bg-[#080808] border border-[#1A1A1A] text-center">
                    <div className="font-mono text-[9px] text-[#F5F3EF]/30">{s.k}</div>
                    <div className="font-bold text-[13px] mt-1">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-[#1A1A1A] bg-[#080808] p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-[20px] tracking-tight uppercase">Partnership Inquiry</h3>
              <span className="font-mono text-[10px] px-2 py-1 bg-[#FF4D00] text-white">RESPONSE &lt; 24H</span>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Project Name" className="h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
                <input placeholder="Collection Size (e.g. 10k)" className="h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Your X Handle" className="h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
                <input placeholder="Budget Range" className="h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
              </div>
              <textarea placeholder="Tell us about the drop — intended use, timeline, special finishes?" rows={4} className="w-full p-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none resize-none" />
              
              <MagneticButton variant="light" size="lg" className="w-full" onClick={() => alert('Inquiry sent! Mock — Nemo will DM you on X.')}>
                Send Inquiry → Nemo DMs You
              </MagneticButton>
              
              <div className="font-mono text-[9px] text-center text-[#F5F3EF]/30">
                This stays human-handled. No auto-quotes. Nemo reviews every partnership personally.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
