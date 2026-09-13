'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const steps = [
  {
    n: '01',
    title: 'Submit',
    desc: 'Paste contract + token ID or upload art. We verify ownership via Alchemy read-only. Live preview in 0.3s with true GLSL.',
    detail: 'Supports 15+ chains • IPFS • Direct upload • No wallet custody',
    color: '#F5F3EF',
    icon: '◍',
  },
  {
    n: '02',
    title: 'Choose',
    desc: 'Base, Holo, Cracked Ice, Gold. Standard, Premium, Vault slab. See foil react in real-time with pointer.',
    detail: '4 finishes • 3 slab tiers • 1/1 or batch • GLSL shader swap',
    color: '#FF4D00',
    icon: '⬢',
  },
  {
    n: '03',
    title: 'Preview',
    desc: 'Spin it. 360° turntable with OrbitControls and true optical shader. What you see is what gets forged.',
    detail: 'WebGL • True foil • Exportable • 60FPS',
    color: '#00E5FF',
    icon: '◎',
  },
  {
    n: '04',
    title: 'Forge',
    desc: '7-12 day production. Optical-grade PETG, micro-bevel, ultrasonic welded, hand-sealed. Shipped tracked via Shippo.',
    detail: 'Made in Ohio • Worldwide • Tracked • 0.8% defect',
    color: '#FFE600',
    icon: '⬣',
  },
  {
    n: '05',
    title: 'Flex',
    desc: 'It arrives. Heavier than you expected. You post it. Your timeline loses it. You reorder. 2,847 slabs and counting.',
    detail: '2,847 slabs • 12 communities • 4.9/5 rating',
    color: '#FF00E5',
    icon: '✦',
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Line progress
      gsap.to(lineRef.current, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          end: 'bottom bottom',
          scrub: 1,
        }
      });

      // SVG path drawing
      if (svgPathRef.current) {
        const path = svgPathRef.current;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center',
            end: 'bottom bottom',
            scrub: 1.5,
          }
        });
      }

      // Steps stagger with SplitType-like effect
      gsap.utils.toArray('.how-step').forEach((step: any, i) => {
        const title = step.querySelector('.step-title');
        const desc = step.querySelector('.step-desc');
        
        gsap.fromTo(step,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );

        if (title) {
          gsap.fromTo(title,
            { x: -20, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.6,
              delay: 0.2,
              scrollTrigger: {
                trigger: step,
                start: 'top 80%',
              }
            }
          );
        }
        
        gsap.fromTo(step.querySelector('.step-number'),
          { scale: 0.5, opacity: 0, rotate: -10 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
            }
          }
        );

        // Icon rotation on scroll
        gsap.to(step.querySelector('.step-icon'), {
          rotate: 360,
          scrollTrigger: {
            trigger: step,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={containerRef} className="relative py-24 md:py-32 px-6 md:px-12 xl:px-24 bg-[#0a0a0a] border-y border-[#1A1A1A] overflow-hidden">
      {/* SVG Production Line */}
      <div className="absolute left-[48px] md:left-[96px] xl:left-[120px] top-0 bottom-0 w-[2px] hidden lg:block pointer-events-none">
        <svg width="2" height="100%" className="absolute inset-0 h-full w-full">
          <path
            ref={svgPathRef}
            d="M1 0 L1 100%"
            stroke="#FF4D00"
            strokeWidth="2"
            strokeDasharray="8 8"
            fill="none"
            className="opacity-60"
          />
        </svg>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 md:gap-24">
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">01 / PROCESS • SVG LINE DRAWING</span>
              <div className="w-12 h-[1px] bg-[#FF4D00]" />
            </div>
            
            <h2 className="font-display font-black text-[14vw] md:text-[10vw] lg:text-[7vw] leading-[0.85] tracking-tighter uppercase">
              How<br/>
              <span className="font-light italic lowercase">it works</span>
            </h2>

            <div className="mt-8 p-6 bg-[#111] border border-[#1A1A1A] relative overflow-hidden group hover:border-[#FF4D00]/20 transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#FF4D00" strokeWidth="0.5" strokeDasharray="4 4" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="#FF4D00" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="20" fill="none" stroke="#FF4D00" strokeWidth="1" />
                </svg>
              </div>
              
              <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 mb-3">PRODUCTION SPECS • OPTICAL GRADE</div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between"><span className="text-[#F5F3EF]/40">MATERIAL</span><span className="text-[#F5F3EF]">Optical Grade PETG • 120g</span></div>
                <div className="flex justify-between"><span className="text-[#F5F3EF]/40">THICKNESS</span><span className="text-[#F5F3EF]">6.2mm • Bevel 0.5mm</span></div>
                <div className="flex justify-between"><span className="text-[#F5F3EF]/40">SEAL</span><span className="text-[#F5F3EF]">Ultrasonic Welded • 40kHz</span></div>
                <div className="flex justify-between"><span className="text-[#F5F3EF]/40">PRINT</span><span className="text-[#F5F3EF]">600dpi Dye-Sub • CMYK+W</span></div>
                <div className="flex justify-between"><span className="text-[#F5F3EF]/40">TIME</span><span className="text-[#FF4D00] font-bold">7-12 Days • Ohio</span></div>
                <div className="flex justify-between"><span className="text-[#F5F3EF]/40">PHYSICS</span><span className="text-[#00E5FF]">Rapier • 60FPS • Mass 0.6</span></div>
              </div>
            </div>

            <div className="mt-8 font-body text-[14px] leading-relaxed text-[#F5F3EF]/50">
              We don't print cards. We forge artifacts. Every slab is sealed, graded-style, with a label that says PSA 10 even though we know PSA would be jealous. Now with true physics and GLSL.
            </div>

            {/* Mini production line visualization */}
            <div className="mt-8 border border-[#1A1A1A] p-4 bg-[#080808]">
              <div className="font-mono text-[9px] tracking-widest text-[#F5F3EF]/30 mb-3">PRODUCTION LINE • LIVE</div>
              <div className="flex items-center gap-2">
                {['Submit', 'Design', 'Print', 'Seal', 'Ship'].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className={`h-1 w-full ${i <= 2 ? 'bg-[#FF4D00]' : 'bg-[#1A1A1A]'} transition-colors`} />
                      <div className="font-mono text-[8px] text-[#F5F3EF]/40 mt-1 text-center">{stage}</div>
                    </div>
                    {i < 4 && <div className="w-1 h-1 bg-[#2A2A2A] rounded-full" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-[#1A1A1A] hidden md:block">
              <div ref={lineRef} className="absolute top-0 left-0 w-full h-full bg-[#FF4D00] origin-top scale-y-0" />
            </div>

            <div className="space-y-16 md:space-y-24">
              {steps.map((step, i) => (
                <div key={step.n} className="how-step relative flex gap-6 md:gap-10 group">
                  <div className="step-number shrink-0 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center font-mono text-[11px] font-bold text-[#F5F3EF] z-10 group-hover:border-[#FF4D00]/50 group-hover:bg-[#FF4D00] group-hover:text-white transition-colors">
                    {step.n}
                  </div>

                  <div className="flex-1 pb-8 border-b border-[#1A1A1A] last:border-0">
                    <div className="flex flex-wrap items-baseline gap-4 mb-4">
                      <h3 className="step-title font-display font-black text-[36px] md:text-[48px] leading-none tracking-tighter uppercase flex items-center gap-3" style={{ color: step.color }}>
                        <span className="step-icon inline-block">{step.icon}</span>
                        {step.title}
                      </h3>
                      <span className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/30">{step.detail}</span>
                    </div>
                    <p className="step-desc font-body text-[16px] md:text-[18px] leading-[1.4] text-[#F5F3EF]/70 max-w-[480px]">
                      {step.desc}
                    </p>

                    <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-[#1A1A1A] to-transparent relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF4D00]/50 to-transparent w-[40%] animate-[marquee_2s_linear_infinite]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
