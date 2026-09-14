import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const finish = searchParams.get('finish') || 'holo';
  const name = searchParams.get('name') || 'BAYC #2087';
  const collection = searchParams.get('collection') || 'Bored Ape Yacht Club';

  const finishColors: Record<string, string> = {
    'base': '#F5F3EF',
    'holo': '#00E5FF',
    'cracked-ice': '#FFFFFF',
    'gold': '#FFD700',
  };

  const finishColor = finishColors[finish] || '#FF4D00';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#080808',
          color: '#F5F3EF',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#F5F3EF', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px' }}>N</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontWeight: 900, fontSize: '16px', letterSpacing: '-0.02em' }}>NEMO'S CARD SHOP</div>
              <div style={{ display: 'flex', fontSize: '9px', letterSpacing: '0.2em', opacity: 0.6 }}>DIGITAL SOUL • PHYSICAL FORM</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: '8px', height: '8px', background: finishColor, borderRadius: '50%' }} />
            <div style={{ display: 'flex', fontSize: '10px', letterSpacing: '0.2em', opacity: 0.6 }}>{finish.toUpperCase()} • LIVE OG</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', gap: '60px', alignItems: 'center', zIndex: 10, marginTop: '40px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '12px', letterSpacing: '0.3em', color: '#FF4D00', marginBottom: '16px' }}>THE VAULT • DYNAMIC OG • {finish.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '72px', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
              <div style={{ display: 'flex' }}>Digital</div>
              <div style={{ display: 'flex', fontWeight: 300, fontStyle: 'italic', textTransform: 'lowercase' }}>soul,</div>
              <div style={{ display: 'flex', color: 'rgba(245,243,239,0.1)' }}>Physical</div>
              <div style={{ display: 'flex', 
                background: `linear-gradient(100deg, #FF4D00, #00E5FF, #FFE600, #FF00E5)`,
                backgroundClip: 'text',
                color: 'transparent',
              }}>Form.</div>
            </div>
            <div style={{ display: 'flex', marginTop: '24px', fontSize: '16px', opacity: 0.6, lineHeight: 1.5, maxWidth: '400px' }}>
              {name} • {collection} • {finish.toUpperCase()} finish • Optical grade • 2,847 slabs forged
            </div>
          </div>

          {/* Card preview */}
          <div style={{ width: '320px', height: '440px', background: '#111', border: '1px solid #2A2A2A', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#0a0a0a', borderBottom: '1px solid #2A2A2A', fontSize: '8px', letterSpacing: '0.2em' }}>
              <span>NEMO • GRADED</span>
              <span>PSA 10 • GEM MINT</span>
            </div>
            <div style={{ flex: 1, background: `linear-gradient(105deg, #111, ${finishColor}20, #111)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 700, textAlign: 'center', padding: '20px' }}>
                <div style={{ display: 'flex' }}>{name}</div>
                <div style={{ display: 'flex', fontSize: '10px', opacity: 0.5, marginTop: '8px' }}>{collection}</div>
              <div style={{ fontSize: '9px', marginTop: '16px', padding: '4px 8px', background: finishColor, color: finish === 'base' ? 'black' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{finish.toUpperCase()}</div>
              </div>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 30%, ${finishColor}40, transparent 70%)`, mixBlendMode: 'overlay' }} />
            </div>
            <div style={{ height: '2px', background: finishColor }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', letterSpacing: '0.1em', opacity: 0.3, zIndex: 10, borderTop: '1px solid #1A1A1A', paddingTop: '16px' }}>
          <span>©2024 NEMO'S CARD SHOP • TRUE WEBGL • RAPIER PHYSICS • GLSL</span>
          <span>2,847 SLABS FORGED • 12 COMMUNITIES • 4.9/5</span>
        </div>

        {/* Foil accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, #FF4D00, #00E5FF, #FFE600, #FF4D00)`, zIndex: 20 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
