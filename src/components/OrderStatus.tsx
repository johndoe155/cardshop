'use client';
import { useState } from 'react';
import { MagneticButton } from './ui/MagneticButton';

const mockOrder = {
  id: 'NMO-8841',
  email: 'collector@example.com',
  item: 'BAYC #2087 - Gold',
  status: 2, // 0 received, 1 design, 2 production, 3 shipped, 4 delivered
  tracking: '1Z999AA10123456784',
  steps: ['Received', 'In Design', 'In Production', 'Shipped', 'Delivered'],
};

export function OrderStatus() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [found, setFound] = useState(false);

  return (
    <section id="status" className="relative py-24 md:py-32 px-6 md:px-12 xl:px-24 bg-[#0a0a0a] border-y border-[#1A1A1A]">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] border border-[#2A2A2A] font-mono text-[10px] tracking-widest text-[#F5F3EF]/50 mb-6">
            <span className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse" />
            LIVE TRACKING • SHIPPO API • MOCK DATA
          </div>
          <h2 className="font-display font-black text-[10vw] md:text-[6vw] leading-[0.85] tracking-tighter uppercase">
            Track<br/>
            <span className="font-light italic lowercase">Your Slab</span>
          </h2>
        </div>

        <div className="border border-[#1A1A1A] bg-[#080808] p-6 md:p-10">
          {!found ? (
            <>
              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-end">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 mb-6">ENTER ORDER DETAILS • MOCK LOOKUP</div>
                  <div className="space-y-4">
                    <div>
                      <label className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/50 mb-2 block">ORDER NUMBER</label>
                      <input
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        placeholder="NMO-8841 (try this)"
                        className="w-full h-14 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[14px] tracking-widest placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/50 mb-2 block">EMAIL</label>
                      <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="collector@example.com"
                        className="w-full h-14 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <MagneticButton variant="orange" size="lg" className="w-full h-14" onClick={() => setFound(true)}>
                    Track Slab →
                  </MagneticButton>
                  <div className="mt-3 font-mono text-[9px] text-center text-[#F5F3EF]/30">Try NMO-8841 for demo • Any email works</div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-[#1A1A1A] grid md:grid-cols-3 gap-6 font-mono text-[11px]">
                <div><span className="text-[#F5F3EF]/30">AVG PRODUCTION:</span> <span className="text-[#F5F3EF]">7-12 days</span></div>
                <div><span className="text-[#F5F3EF]/30">SHIPPING:</span> <span className="text-[#F5F3EF]">USPS • UPS • Worldwide</span></div>
                <div><span className="text-[#F5F3EF]/30">SUPPORT:</span> <span className="text-[#FF4D00]">DM @nemoscardshop</span></div>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-[#FF4D00]">ORDER FOUND • LIVE</div>
                  <div className="font-display font-black text-[24px] tracking-tight mt-1">{mockOrder.id} • {mockOrder.item}</div>
                </div>
                <button onClick={() => setFound(false)} className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 hover:text-[#F5F3EF] transition-colors">← NEW SEARCH</button>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-[#1A1A1A]">
                  <div className="absolute top-0 left-0 w-full bg-[#FF4D00] transition-all duration-1000" style={{ height: `${(mockOrder.status / (mockOrder.steps.length - 1)) * 100}%` }} />
                </div>

                <div className="space-y-8">
                  {mockOrder.steps.map((s, i) => (
                    <div key={s} className="relative flex gap-6">
                      <div className={`shrink-0 w-8 h-8 rounded-full border grid place-items-center font-mono text-[10px] font-bold z-10 transition-colors ${i <= mockOrder.status ? 'bg-[#FF4D00] border-[#FF4D00] text-white' : 'bg-[#111] border-[#2A2A2A] text-[#F5F3EF]/30'}`}>
                        {i < mockOrder.status ? '✓' : i + 1}
                      </div>
                      <div className={`flex-1 pb-8 border-b ${i === mockOrder.steps.length - 1 ? 'border-0' : 'border-[#1A1A1A]'} ${i <= mockOrder.status ? '' : 'opacity-40'}`}>
                        <div className="flex items-baseline gap-3">
                          <span className="font-bold text-[14px] tracking-wide uppercase">{s}</span>
                          {i === mockOrder.status && <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#FF4D00] text-white animate-pulse">CURRENT</span>}
                          <span className="font-mono text-[10px] text-[#F5F3EF]/30 ml-auto">{i === 0 ? 'Mar 12' : i === 1 ? 'Mar 13' : i === 2 ? 'Mar 15 — Today' : i === 3 ? 'Est. Mar 20' : 'Est. Mar 23'}</span>
                        </div>
                        <div className="font-body text-[13px] text-[#F5F3EF]/60 mt-1">
                          {i === 0 && 'Payment confirmed, artwork verified. Queued for design.'}
                          {i === 1 && 'Design locked, color-corrected for print. Awaiting forge.'}
                          {i === 2 && 'Currently being forged in Ohio. Optical-grade PETG, ultrasonic sealed.'}
                          {i === 3 && `Tracking: ${mockOrder.tracking} — carrier scan pending`}
                          {i === 4 && 'Delivered • Post your slab and tag @nemoscardshop for a repost'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {mockOrder.status >= 3 && (
                <div className="mt-8 p-4 bg-[#111] border border-[#1A1A1A] flex items-center justify-between">
                  <div className="font-mono text-[11px]"><span className="text-[#F5F3EF]/40">TRACKING:</span> <span className="text-[#F5F3EF] tracking-widest">{mockOrder.tracking}</span></div>
                  <a href="#" className="font-mono text-[10px] tracking-widest text-[#FF4D00] hover:text-white transition-colors">OPEN IN SHIPPO →</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
