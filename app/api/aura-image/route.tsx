import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Koku Aurası'
  const top1 = searchParams.get('top1') || ''
  const fal = searchParams.get('fal') || ''
  let families: Array<{ name: string; pct: number }> = []
  try { families = JSON.parse(searchParams.get('families') || '[]') } catch {}

  const MAX_BAR = 200

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #1a1430 0%, #2B2640 40%, #3d2e6e 75%, #5B4A82 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(185,165,232,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(159,180,224,0.07)', display: 'flex' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '80px 80px 60px', flex: 1, position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, letterSpacing: '0.32em', color: 'rgba(185,165,232,0.65)', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', marginBottom: 4 }}>
                ASYA · Elegance VIP Perfume
              </div>
              <div style={{ fontSize: 14, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
                Koku Aurası
              </div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(185,165,232,0.15)', border: '1px solid rgba(185,165,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'rgba(185,165,232,0.8)' }}>
              ✦
            </div>
          </div>

          {/* Title */}
          <div style={{ fontSize: 72, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.05, marginBottom: 10, letterSpacing: '-0.02em' }}>
            {title}
          </div>

          {/* Divider */}
          <div style={{ width: 60, height: 2, background: 'rgba(185,165,232,0.5)', marginBottom: 40, borderRadius: 2, display: 'flex' }} />

          {/* Scent families */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 44 }}>
            {families.slice(0, 4).map((sf, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: Math.round((sf.pct / 50) * MAX_BAR), height: 6, background: i === 0 ? 'rgba(185,165,232,0.9)' : i === 1 ? 'rgba(159,180,224,0.75)' : i === 2 ? 'rgba(185,165,232,0.55)' : 'rgba(159,180,224,0.40)', borderRadius: 3, display: 'flex', flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', fontFamily: 'Arial, sans-serif' }}>{sf.name}</span>
                  <span style={{ fontSize: 16, color: 'rgba(185,165,232,0.7)', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>{sf.pct}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Signature scent */}
          {top1 ? (
            <div style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 36, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.28em', color: 'rgba(185,165,232,0.65)', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', marginBottom: 8 }}>
                İmza Koku
              </div>
              <div style={{ fontSize: 28, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.2 }}>
                {top1}
              </div>
            </div>
          ) : null}

          {/* Fal hikayesi */}
          {fal ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontSize: 24, flexShrink: 0, display: 'flex' }}>🔮</div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.68)', lineHeight: 1.55, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                {fal.length > 140 ? fal.slice(0, 140) + '…' : fal}
              </div>
            </div>
          ) : null}

          {/* Footer */}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, letterSpacing: '0.20em', color: 'rgba(255,255,255,0.28)', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
              asya.elegancevipperfume.com
            </div>
            <div style={{ fontSize: 13, letterSpacing: '0.16em', color: 'rgba(185,165,232,0.5)', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
              Senin koku auran ne? ✨
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  )
}
