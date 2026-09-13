'use client';
import { useState } from 'react';
import { useVaultStore, FinishType, SlabType } from '@/store/useVaultStore';
import { MagneticButton } from './ui/MagneticButton';
import { SlabFrame } from './ui/SlabFrame';
import { fetchNFT, DEMO_NFTS } from '@/lib/utils';
import { sounds } from '@/lib/sounds';
import { ForgePreviewCanvas } from './canvas/ForgePreview';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with Three
const ForgePreview = dynamic(() => Promise.resolve(ForgePreviewCanvas), { ssr: false });

const finishes: { id: FinishType; label: string; price: string; desc: string; shader: string }[] = [
  { id: 'base', label: 'Base', price: '$49', desc: 'Matte, clean, grail-ready', shader: 'Matte • No foil' },
  { id: 'holo', label: 'Holo', price: '$79', desc: 'Rainbow foil, light-reactive', shader: 'Fresnel + rainbow' },
  { id: 'cracked-ice', label: 'Cracked Ice', price: '$99', desc: 'Fractured, icy, 1/1 energy', shader: 'Voronoi + displacement' },
  { id: 'gold', label: 'Gold', price: '$129', desc: '24k mirror, vault tier', shader: 'Metallic • SSS' },
];

const slabTypes: { id: SlabType; label: string; price: string; spec: string }[] = [
  { id: 'standard', label: 'Standard', price: '+$0', spec: '6.2mm • 120g' },
  { id: 'premium', label: 'Premium • Thick', price: '+$15', spec: '8.5mm • 180g • Bevel' },
  { id: 'vault', label: 'Vault • Museum', price: '+$40', spec: '10mm • 250g • UV' },
];

export function Forge() {
  const { finishType, setFinishType, slabType, setSlabType, nftData, setNftData, isFetchingNFT, setIsFetchingNFT, setCursor, cartCount, setCartCount } = useVaultStore();
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showWebGL, setShowWebGL] = useState(true);

  const totalPrice = (() => {
    const base = { base: 49, holo: 79, 'cracked-ice': 99, gold: 129 }[finishType];
    const slabAdd = { standard: 0, premium: 15, vault: 40 }[slabType];
    return (base + slabAdd) * quantity;
  })();

  const handleFetch = async () => {
    if (!contract || !tokenId) return;
    setIsFetchingNFT(true);
    sounds.click();
    try {
      const data = await fetchNFT(contract, tokenId);
      setNftData(data);
      setUploadPreview(null);
      sounds.success();
      setStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingNFT(false);
    }
  };

  const handleDemo = async (c: string, t: string) => {
    setContract(c);
    setTokenId(t);
    setIsFetchingNFT(true);
    const data = await fetchNFT(c, t);
    setNftData(data);
    setIsFetchingNFT(false);
    sounds.success();
    setStep(2);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    setNftData({
      image: url,
      name: file.name,
      collection: 'Custom Upload',
      tokenId: 'CUSTOM',
      contract: '0xCUSTOM',
    });
    sounds.success();
    setStep(2);
  };

  return (
    <section id="forge" className="relative py-24 md:py-32 px-6 md:px-12 xl:px-24 bg-[#080808] border-y border-[#1A1A1A] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)`,
      }} />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">03 / FORGE • TRUE WEBGL</span>
              <div className="w-12 h-[1px] bg-[#FF4D00]" />
              <span className="font-mono text-[10px] text-[#F5F3EF]/30">LIVE GLSL • ORBITCONTROLS • 60FPS</span>
            </div>
            <h2 className="font-display font-black text-[12vw] md:text-[8vw] lg:text-[6vw] leading-[0.85] tracking-tighter uppercase">
              Forge<br/>
              <span className="font-light italic lowercase">Your Grail</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {[1,2,3,4].map(n => (
              <div key={n} className={`flex items-center gap-2 ${n <= step ? '' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full grid place-items-center font-mono text-[11px] font-bold border transition-colors ${n === step ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : n < step ? 'bg-[#F5F3EF] text-black border-[#F5F3EF]' : 'bg-transparent text-[#F5F3EF]/40 border-[#2A2A2A]'}`}>
                  {n < step ? '✓' : n}
                </div>
                {n < 4 && <div className={`w-8 h-[1px] ${n < step ? 'bg-[#F5F3EF]' : 'bg-[#2A2A2A]'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12">
          <div className="space-y-6">
            <div className={`border transition-colors ${step === 1 ? 'border-[#FF4D00]/50 bg-[#0f0f0f]' : 'border-[#1A1A1A] bg-[#0a0a0a]'} p-6 md:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-[20px] tracking-tight uppercase">01 — Submit NFT / Artwork</h3>
                <span className="font-mono text-[10px] text-[#F5F3EF]/30">READ-ONLY • ALCHEMY DEMO</span>
              </div>

              {step === 1 ? (
                <>
                  <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/50 mb-2 block">CONTRACT ADDRESS</label>
                        <input
                          value={contract}
                          onChange={e => setContract(e.target.value)}
                          placeholder="0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
                          className="w-full h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] text-[#F5F3EF] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/50 mb-2 block">TOKEN ID</label>
                        <div className="flex gap-2">
                          <input
                            value={tokenId}
                            onChange={e => setTokenId(e.target.value)}
                            placeholder="1"
                            className="flex-1 h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] text-[#F5F3EF] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none transition-colors"
                          />
                          <MagneticButton variant="orange" size="md" onClick={handleFetch} disabled={isFetchingNFT || !contract || !tokenId}>
                            {isFetchingNFT ? 'FETCHING...' : 'FETCH →'}
                          </MagneticButton>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#1A1A1A]">
                        <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 mb-3">OR TRY DEMO:</div>
                        <div className="flex flex-wrap gap-2">
                          {DEMO_NFTS.map(d => (
                            <button
                              key={d.label}
                              onClick={() => handleDemo(d.contract, d.tokenId)}
                              className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] font-mono text-[10px] text-[#F5F3EF]/70 hover:text-[#F5F3EF] hover:border-[#FF4D00]/30 transition-colors cursor-none"
                              onMouseEnter={() => setCursor(true, 'FETCH')}
                              onMouseLeave={() => setCursor(false)}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 mb-3">OR UPLOAD DIRECTLY</div>
                      <label className="group relative flex flex-col items-center justify-center w-full h-[160px] border border-dashed border-[#2A2A2A] hover:border-[#FF4D00]/50 bg-[#111]/50 hover:bg-[#111] transition-colors cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                        <div className="font-mono text-[10px] text-[#F5F3EF]/40 group-hover:text-[#F5F3EF]/70 transition-colors">DROP IMAGE OR CLICK</div>
                        <div className="font-mono text-[9px] text-[#F5F3EF]/20 mt-1">PNG, JPG, WEBP • MAX 10MB</div>
                        <div className="mt-4 w-8 h-8 border border-[#2A2A2A] grid place-items-center group-hover:border-[#FF4D00]/50 transition-colors">+</div>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <img src={nftData?.image || uploadPreview || ''} alt="" className="w-16 h-16 object-cover border border-[#2A2A2A]" />
                  <div>
                    <div className="font-bold text-[14px]">{nftData?.name}</div>
                    <div className="font-mono text-[10px] text-[#F5F3EF]/50">{nftData?.collection} • #{nftData?.tokenId}</div>
                  </div>
                  <button onClick={() => setStep(1)} className="ml-auto font-mono text-[10px] tracking-widest text-[#FF4D00] hover:text-white transition-colors">EDIT</button>
                </div>
              )}
            </div>

            <div className={`border transition-colors ${step === 2 ? 'border-[#FF4D00]/50 bg-[#0f0f0f]' : 'border-[#1A1A1A] bg-[#0a0a0a] opacity-60'} p-6 md:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-[20px] tracking-tight uppercase">02 — Choose Finish & Slab</h3>
                <span className="font-mono text-[10px] text-[#F5F3EF]/30">GLSL SHADER • LIVE</span>
              </div>

              {step >= 2 && (
                <>
                  <div className="mb-8">
                    <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 mb-3">FINISH • SELECT ONE • REAL SHADER SWAP</div>
                    <div className="grid grid-cols-2 gap-2">
                      {finishes.map(f => (
                        <button
                          key={f.id}
                          onClick={() => { setFinishType(f.id); sounds.foil(); }}
                          className={`text-left p-4 border transition-all group ${finishType === f.id ? 'bg-[#F5F3EF] text-black border-[#F5F3EF]' : 'bg-[#111] text-[#F5F3EF]/70 border-[#2A2A2A] hover:border-[#F5F3EF]/20 hover:text-[#F5F3EF]'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[13px] tracking-wide uppercase">{f.label}</span>
                            <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 ${finishType === f.id ? 'bg-black text-white' : 'bg-[#FF4D00] text-white'}`}>{f.price}</span>
                          </div>
                          <div className={`font-mono text-[10px] mt-1 ${finishType === f.id ? 'text-black/60' : 'text-[#F5F3EF]/40'}`}>{f.desc}</div>
                          <div className={`font-mono text-[9px] mt-2 px-1.5 py-0.5 inline-block ${finishType === f.id ? 'bg-black/10 text-black/50' : 'bg-[#1A1A1A] text-[#F5F3EF]/30'}`}>{f.shader}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40 mb-3">SLAB TYPE • THICKNESS & WEIGHT</div>
                    <div className="flex gap-2">
                      {slabTypes.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSlabType(s.id)}
                          className={`flex-1 p-3 border font-mono text-[11px] tracking-wide uppercase transition-colors ${slabType === s.id ? 'bg-[#1A1A1A] text-[#F5F3EF] border-[#F5F3EF]/20' : 'bg-transparent text-[#F5F3EF]/40 border-[#1A1A1A] hover:text-[#F5F3EF]/70'}`}
                        >
                          <div>{s.label}</div>
                          <div className="text-[10px] text-[#FF4D00] mt-1">{s.price}</div>
                          <div className="text-[9px] text-[#F5F3EF]/30 mt-1 normal-case">{s.spec}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <MagneticButton variant="dark" size="md" onClick={() => setStep(1)}>← Back</MagneticButton>
                    <MagneticButton variant="light" size="md" className="flex-1" onClick={() => { setStep(3); sounds.success(); }}>Continue to Preview →</MagneticButton>
                  </div>
                </>
              )}
            </div>

            <div className={`border transition-colors ${step === 3 ? 'border-[#FF4D00]/50 bg-[#0f0f0f]' : 'border-[#1A1A1A] bg-[#0a0a0a] opacity-60'} p-6 md:p-8`}>
              <h3 className="font-display font-bold text-[20px] tracking-tight uppercase mb-6">03 — Preview & Quantity</h3>
              {step >= 3 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40">QUANTITY</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center hover:border-[#F5F3EF]/20 transition-colors">−</button>
                      <span className="w-12 h-8 bg-[#111] border border-[#2A2A2A] grid place-items-center font-mono text-[12px]">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] grid place-items-center hover:border-[#F5F3EF]/20 transition-colors">+</button>
                    </div>
                    <span className="font-mono text-[10px] text-[#F5F3EF]/30">MAX 10 FOR 1/1 • BULK IN PARTNERSHIPS</span>
                  </div>
                  <div className="flex gap-2">
                    <MagneticButton variant="dark" size="md" onClick={() => setStep(2)}>← Back</MagneticButton>
                    <MagneticButton variant="orange" size="md" className="flex-1" onClick={() => { setStep(4); sounds.slabClack(); }}>Proceed to Checkout — ${totalPrice}</MagneticButton>
                  </div>
                </>
              )}
            </div>

            {step === 4 && (
              <div className="border border-[#FF4D00] bg-[#0f0f0f] p-6 md:p-8 animate-[fadeIn_0.5s]">
                <h3 className="font-display font-bold text-[20px] tracking-tight uppercase mb-6">04 — Checkout (Mock)</h3>
                <div className="space-y-4 mb-6">
                  <input placeholder="Email" className="w-full h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
                  <input placeholder="Shipping Address" className="w-full h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="City" className="h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
                    <input placeholder="Postal" className="h-12 px-4 bg-[#111] border border-[#2A2A2A] font-mono text-[12px] placeholder:text-[#F5F3EF]/20 focus:border-[#FF4D00]/50 focus:outline-none" />
                  </div>
                </div>
                <MagneticButton variant="light" size="lg" className="w-full" onClick={() => {
                  setCartCount(cartCount + quantity);
                  sounds.success();
                  alert(`Order placed! Mock confirmation NMO-${Date.now().toString().slice(-6)} • $${totalPrice} • You will receive tracking via email.`);
                  setStep(1);
                  setNftData(null);
                  setUploadPreview(null);
                }}>
                  Pay ${totalPrice} • Mock Stripe
                </MagneticButton>
                <div className="mt-3 font-mono text-[9px] text-center text-[#F5F3EF]/30">Stripe keys not configured • This is a mock checkout for demo</div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <SlabFrame label={`TRUE WEBGL PREVIEW • ${finishType.toUpperCase()} • ${slabType.toUpperCase()} • GLSL`} foil>
              <div className="relative">
                <div className="flex items-center justify-between p-2 bg-[#0a0a0a] border-b border-[#1A1A1A]">
                  <div className="flex gap-1">
                    <button onClick={() => setShowWebGL(true)} className={`px-2 py-1 font-mono text-[9px] tracking-widest ${showWebGL ? 'bg-[#F5F3EF] text-black' : 'bg-[#1A1A1A] text-[#F5F3EF]/50'}`}>WEBGL • TRUE</button>
                    <button onClick={() => setShowWebGL(false)} className={`px-2 py-1 font-mono text-[9px] tracking-widest ${!showWebGL ? 'bg-[#F5F3EF] text-black' : 'bg-[#1A1A1A] text-[#F5F3EF]/50'}`}>DOM • FALLBACK</button>
                  </div>
                  <div className="font-mono text-[9px] text-[#FF4D00]">● LIVE SHADER</div>
                </div>
                
                {showWebGL ? (
                  <div className="aspect-[3/4] bg-[#050505]">
                    <ForgePreview />
                  </div>
                ) : (
                  <div className="aspect-[3/4] relative bg-[#050505] overflow-hidden">
                    {(nftData?.image || uploadPreview) ? (
                      <img src={nftData?.image || uploadPreview || ''} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center p-12 text-center">
                        <div>
                          <div className="w-16 h-16 mx-auto border border-dashed border-[#2A2A2A] grid place-items-center mb-4">
                            <span className="font-mono text-[20px] text-[#F5F3EF]/20">+</span>
                          </div>
                          <div className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/30">FETCH AN NFT TO SEE TRUE WEBGL</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
                      style={{
                        background: finishType === 'holo' ? `linear-gradient(105deg, transparent 30%, rgba(255,77,0,0.4), rgba(0,229,255,0.4), transparent 70%)` :
                                   finishType === 'cracked-ice' ? `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 3px)` :
                                   finishType === 'gold' ? `linear-gradient(180deg, rgba(255,215,0,0.3), transparent, rgba(255,215,0,0.2))` : 'transparent',
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="font-bold text-[14px] text-white truncate max-w-[200px]">{nftData?.name || 'Untitled'}</div>
                          <div className="font-mono text-[10px] text-white/60">{nftData?.collection || '—'} • {finishType.toUpperCase()}</div>
                        </div>
                        <div className="font-mono text-[10px] px-2 py-1 bg-[#FF4D00] text-white font-bold">${totalPrice}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SlabFrame>

            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'Finish', v: finishType, d: finishes.find(f => f.id === finishType)?.shader },
                { k: 'Slab', v: slabType, d: slabTypes.find(s => s.id === slabType)?.spec },
                { k: 'Qty', v: `×${quantity}`, d: `$${totalPrice}` },
              ].map(s => (
                <div key={s.k} className="p-3 bg-[#0a0a0a] border border-[#1A1A1A]">
                  <div className="font-mono text-[9px] tracking-widest text-[#F5F3EF]/30">{s.k}</div>
                  <div className="font-mono text-[11px] font-bold text-[#F5F3EF] uppercase mt-1">{s.v}</div>
                  <div className="font-mono text-[8px] text-[#F5F3EF]/40 mt-1 truncate">{s.d}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#FF4D00]/10 border border-[#FF4D00]/20">
              <div className="font-mono text-[10px] tracking-widest text-[#FF4D00] mb-1">VAULT NOTE • TRUE WEBGL</div>
              <div className="font-body text-[12px] leading-snug text-[#F5F3EF]/70">
                This preview uses the same GLSL shader as final print: fresnel, rainbow gradient, noise. Drag to spin. Pointer drives foil. What you see is what gets forged.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
