'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { galleryData, collections, styles } from '@/data/gallery';
import { useVaultStore } from '@/store/useVaultStore';
import { SlabFrame } from './ui/SlabFrame';
import { MagneticButton } from './ui/MagneticButton';
import { sounds } from '@/lib/sounds';
import gsap from 'gsap';
import dynamic from 'next/dynamic';

// Dynamic import for physics pit to avoid SSR
const GalleryPitPhysics = dynamic(() => import('./canvas/GalleryPitPhysics'), { ssr: false });

export function Gallery() {
  const { setCursor } = useVaultStore();
  const [filterType, setFilterType] = useState<'all' | 'collection' | 'style'>('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'pit'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return galleryData.filter(card => {
      if (selectedCollection !== 'all' && card.collection !== selectedCollection) return false;
      if (selectedStyle !== 'all' && card.style !== selectedStyle) return false;
      return true;
    });
  }, [selectedCollection, selectedStyle]);

  useEffect(() => {
    if (!gridRef.current || viewMode !== 'grid') return;
    gsap.fromTo(gridRef.current.children,
      { y: 40, opacity: 0, rotateX: -10 },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.04, ease: 'power4.out' }
    );
  }, [filtered, viewMode]);

  // Physics drag handlers for grid mode (fake physics)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setIsDragging(true);
    sounds.foil();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Store offset
    target.dataset.offsetX = offsetX.toString();
    target.dataset.offsetY = offsetY.toString();
    
    // Ghost image
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.transform = 'rotate(5deg) scale(1.1)';
    ghost.style.opacity = '0.8';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, offsetX, offsetY);
    setTimeout(() => ghost.remove(), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    const target = e.currentTarget as HTMLElement;
    // Toss effect
    gsap.fromTo(target,
      { rotation: Math.random() * 20 - 10, scale: 1.1, z: 50 },
      { rotation: (parseInt(target.dataset.index || '0') % 3 - 1) * 2, scale: 1, z: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)' }
    );
    sounds.slabClack();
  };

  return (
    <section id="gallery" className="relative py-24 md:py-32 px-6 md:px-12 xl:px-24 bg-[#080808]">
      <div className="max-w-[1600px] mx-auto mb-16">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00]">02 / GALLERY • PHYSICS PIT</span>
              <div className="w-12 h-[1px] bg-[#FF4D00]" />
              <span className="font-mono text-[9px] px-2 py-0.5 bg-[#FF4D00] text-white animate-pulse">RAPIER • LIVE</span>
            </div>
            <h2 className="font-display font-black text-[12vw] md:text-[8vw] lg:text-[6vw] leading-[0.85] tracking-tighter uppercase">
              The<br />
              <span className="font-light italic lowercase">Vault</span> Archive
            </h2>
          </div>
          <div className="max-w-[360px]">
            <p className="font-body text-[14px] leading-relaxed text-[#F5F3EF]/60">
              Every slab tells a story. Drag them, toss them, they collide. Filter by collection or finish. Each one was a JPEG once. Now it's a grail.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="font-mono text-[10px] text-[#F5F3EF]/30">
                {filtered.length} SLABS • {galleryData.filter(c => c.type === '1/1').length} 1/1 • {galleryData.filter(c => c.type === 'batch').length} BATCH
              </div>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest border transition-colors ${viewMode === 'grid' ? 'bg-[#F5F3EF] text-black border-[#F5F3EF]' : 'bg-[#1A1A1A] text-[#F5F3EF]/50 border-[#2A2A2A]'}`}
                >
                  GRID
                </button>
                <button
                  onClick={() => { setViewMode('pit'); sounds.success(); }}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest border transition-colors ${viewMode === 'pit' ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'bg-[#1A1A1A] text-[#F5F3EF]/50 border-[#2A2A2A]'}`}
                >
                  PHYSICS PIT →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-2 border-y border-[#1A1A1A] py-4">
          <div className="flex items-center gap-2 mr-6">
            <span className="font-mono text-[10px] tracking-widest text-[#F5F3EF]/40">FILTER:</span>
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'collection', label: 'Collection' },
                { id: 'style', label: 'Finish' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase border transition-colors ${filterType === f.id ? 'bg-[#F5F3EF] text-black border-[#F5F3EF]' : 'bg-transparent text-[#F5F3EF]/50 border-[#2A2A2A] hover:text-[#F5F3EF] hover:border-[#F5F3EF]/20'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filterType === 'collection' && (
            <div className="flex flex-wrap gap-1">
              {collections.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCollection(c)}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase border transition-colors ${selectedCollection === c ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'bg-[#1A1A1A] text-[#F5F3EF]/60 border-[#2A2A2A] hover:text-[#F5F3EF]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {filterType === 'style' && (
            <div className="flex flex-wrap gap-1">
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStyle(s)}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase border transition-colors ${selectedStyle === s ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'bg-[#1A1A1A] text-[#F5F3EF]/60 border-[#2A2A2A] hover:text-[#F5F3EF]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {(selectedCollection !== 'all' || selectedStyle !== 'all') && (
            <button
              onClick={() => { setSelectedCollection('all'); setSelectedStyle('all'); }}
              className="ml-auto font-mono text-[10px] tracking-widest text-[#FF4D00] hover:text-white transition-colors"
            >
              CLEAR ×
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {viewMode === 'pit' ? (
          <div className="space-y-6">
            <div className="p-4 bg-[#FF4D00]/10 border border-[#FF4D00]/20 flex flex-wrap items-center justify-between gap-4">
              <div className="font-mono text-[11px] leading-relaxed">
                <span className="text-[#FF4D00] font-bold">PHYSICS PIT ACTIVE • RAPIER 3D</span><br/>
                <span className="text-[#F5F3EF]/60">Drag cards • They have mass, friction, restitution • Toss one, others collide • Walls keep them in vault</span>
              </div>
              <div className="flex gap-2">
                <span className="font-mono text-[9px] px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A]">GRAVITY: -2</span>
                <span className="font-mono text-[9px] px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A]">MASS: 0.5</span>
                <span className="font-mono text-[9px] px-2 py-1 bg-[#FF4D00] text-white">60FPS</span>
              </div>
            </div>
            <GalleryPitPhysics cards={filtered} />
          </div>
        ) : (
          <div ref={gridRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 ${isDragging ? 'cursor-grabbing' : ''}`}>
            {filtered.map((card, index) => (
              <div
                key={card.id}
                data-index={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                className="group relative select-none"
                style={{ transform: `rotate(${(index % 3 - 1) * 1.5}deg)` }}
                onMouseEnter={() => setCursor(true, 'TOSS')}
                onMouseLeave={() => setCursor(false)}
              >
                <SlabFrame label={`${card.collection} • ${card.year}`} foil interactive>
                  <div className="aspect-[3/4] relative overflow-hidden bg-[#0a0a0a]">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="absolute top-3 left-3 flex gap-1">
                      <span className={`font-mono text-[9px] px-2 py-1 font-bold tracking-widest uppercase
                        ${card.style === 'holo' ? 'bg-[#00E5FF] text-black' : ''}
                        ${card.style === 'cracked-ice' ? 'bg-white text-black' : ''}
                        ${card.style === 'gold' ? 'bg-[#FFD700] text-black' : ''}
                        ${card.style === 'base' ? 'bg-[#F5F3EF] text-black' : ''}
                      `}>
                        {card.style}
                      </span>
                      <span className="font-mono text-[9px] px-2 py-1 bg-black/80 text-white/70 border border-white/10">
                        {card.type}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 font-mono text-[10px] px-2 py-1 bg-[#FF4D00] text-white font-bold">
                      {card.price}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-bold text-[14px] leading-tight text-white">{card.name}</h3>
                      <p className="font-mono text-[10px] text-white/60 mt-1">{card.collection} • {card.id}</p>
                      
                      {card.quote && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="font-body text-[12px] leading-snug italic text-white/80">"{card.quote}"</p>
                          <p className="font-mono text-[9px] text-[#FF4D00] mt-1">— {card.commissioner}</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <MagneticButton variant="light" size="sm" className="flex-1" onClick={() => {
                          document.getElementById('forge')?.scrollIntoView({ behavior: 'smooth' });
                          sounds.success();
                        }}>
                          Get One Like This
                        </MagneticButton>
                      </div>
                    </div>

                    {/* Drag handle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/20 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="font-mono text-[10px]">↔</span>
                    </div>
                  </div>
                </SlabFrame>

                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#080808] border border-[#2A2A2A] grid place-items-center font-mono text-[9px] text-[#F5F3EF]/40 group-hover:text-[#FF4D00] group-hover:border-[#FF4D00]/50 transition-colors">
                  {card.id}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="font-mono text-[12px] tracking-widest text-[#F5F3EF]/30">NO SLABS MATCH • TRY CLEARING FILTERS</div>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto mt-24 border border-[#1A1A1A] p-8 md:p-12 flex flex-wrap items-center justify-between gap-8 bg-[#0a0a0a] group hover:border-[#FF4D00]/20 transition-colors">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-[#FF4D00] mb-2">WANT YOURS IN THE VAULT?</div>
          <div className="font-display font-black text-[32px] md:text-[40px] leading-none tracking-tighter uppercase group-hover:translate-x-1 transition-transform">Your JPEG<br/>Deserves Better</div>
        </div>
        <MagneticButton size="lg" variant="orange" onClick={() => document.getElementById('forge')?.scrollIntoView({ behavior: 'smooth' })}>
          Start Forging — $49
        </MagneticButton>
      </div>
    </section>
  );
}
