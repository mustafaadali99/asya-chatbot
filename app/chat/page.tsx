'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

/* ═══════════════ TYPES ═══════════════ */
type Screen = 'welcome' | 'dashboard' | 'chat' | 'wardrobe' | 'profile' | 'faq'
interface Message { role: 'assistant' | 'user'; content: string; type?: string; product?: ProductData; options?: string[] }
interface ProductData { name: string; image_url: string; web_url: string; woo_id?: number; code?: string; top_notes?: string[]; heart_notes?: string[]; base_notes?: string[] }
interface GardropItem { name: string; image_url: string; web_url: string; woo_id?: number; code?: string; category?: string; addedAt: string }
interface Lead { name: string; email: string; lead_id: string; session_id: string }

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const T = {
  ink: '#2B2640',
  inkSoft: '#5E5878',
  inkMuted: '#8A85A1',
  glass: 'rgba(255,255,255,0.42)',
  glassStrong: 'rgba(255,255,255,0.62)',
  glassEdge: 'rgba(255,255,255,0.85)',
  shadowSoft: '0 12px 30px rgba(94,88,140,0.12)',
  neoOut: '6px 6px 14px rgba(160,152,195,0.30), -6px -6px 14px rgba(255,255,255,0.95)',
  neoIn: 'inset 4px 4px 10px rgba(160,152,195,0.22), inset -4px -4px 10px rgba(255,255,255,0.85)',
  accent: 'linear-gradient(135deg, #B9A5E8, #9FB4E0)',
  accentSolid: '#B9A5E8',
}

/* ═══════════════ ICONS ═══════════════ */
const I = {
  home:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-6 7 6v6a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  catalog: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="3" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/></svg>,
  chat:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  wardrobe:<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 7.2a1.7 1.7 0 1 1 1.7-1.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 7.2v1.5L2 14h16L10 8.7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M3 17c.8-3.4 3.7-5 7-5s6.2 1.6 7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  send:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  mic:     <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><rect x="5" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 9a6 6 0 0 0 12 0M8 15v3M5 18h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  back:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  heart:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  heartFill:<svg width="16" height="16" viewBox="0 0 16 16" fill="#B9A5E8"><path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z"/></svg>,
  plus:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  trash:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>,
  cart:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  external:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  info:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 7v4M8 5.2v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  menu:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>,
}

/* ═══════════════ BOTTLE GLYPH ═══════════════ */
function BottleGlyph({ size = 44, hue = '#D8CDEE' }: { size?: number; hue?: string }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 44 60" fill="none">
      <rect x="17" y="3" width="10" height="7" rx="1.2" fill="#FFFFFF" stroke="#A89FC7" strokeOpacity="0.5" strokeWidth="1"/>
      <rect x="19.5" y="10" width="5" height="4" fill="#FFFFFF" stroke="#A89FC7" strokeOpacity="0.45" strokeWidth="1"/>
      <path d="M8 22 Q8 14, 18 14 L26 14 Q36 14, 36 22 L36 50 Q36 56, 30 56 L14 56 Q8 56, 8 50 Z" fill={hue} stroke="#A89FC7" strokeOpacity="0.35" strokeWidth="1"/>
      <rect x="14" y="34" width="16" height="8" rx="1.5" fill="#FFFFFF" opacity="0.5"/>
    </svg>
  )
}

/* ═══════════════ ASYA PORTRAIT ═══════════════ */
function AsyaPortrait({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="60" fill="#fdf0e0"/>
      <ellipse cx="60" cy="108" rx="38" ry="20" fill="#e8c4a0" opacity="0.6"/>
      <rect x="53" y="76" width="14" height="18" rx="7" fill="#e8c4a0"/>
      <ellipse cx="60" cy="46" rx="27" ry="30" fill="#2a1a0c"/>
      <ellipse cx="60" cy="50" rx="20" ry="23" fill="#f0c09a"/>
      <path d="M33 44 C36 18 50 13 60 13 C70 13 84 18 87 44 C79 30 68 26 60 26 C52 26 41 30 33 44Z" fill="#2a1a0c"/>
      <path d="M33 44 C29 56 31 72 36 84 C37 76 39 68 40 60 C38 52 34 48 33 44Z" fill="#2a1a0c"/>
      <path d="M87 44 C91 56 89 72 84 84 C83 76 81 68 80 60 C82 52 86 48 87 44Z" fill="#2a1a0c"/>
      <path d="M44 44 Q50 41 55 43" stroke="#2a1a0c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M65 43 Q70 41 76 44" stroke="#2a1a0c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <ellipse cx="50" cy="50" rx="5" ry="3.5" fill="white"/>
      <ellipse cx="70" cy="50" rx="5" ry="3.5" fill="white"/>
      <circle cx="51" cy="50" r="2.5" fill="#2a1a0c"/>
      <circle cx="71" cy="50" r="2.5" fill="#2a1a0c"/>
      <circle cx="52" cy="49" r="0.9" fill="white"/>
      <circle cx="72" cy="49" r="0.9" fill="white"/>
      <path d="M52 67 Q56 64 60 65 Q64 64 68 67 Q64 72 60 71 Q56 72 52 67Z" fill="#c0604a"/>
    </svg>
  )
}

function AsyaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size, boxShadow: '0 0 0 1px rgba(255,255,255,0.85), 0 4px 12px rgba(94,88,140,0.15)' }}>
      <AsyaPortrait size={size} />
    </div>
  )
}

/* ═══════════════ GLASS PILL BUTTON ═══════════════ */
function GlassPill({ children, onClick, icon }: { children: React.ReactNode; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} className="btn-ghost" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
      {icon}{children}
    </button>
  )
}

/* ═══════════════ TYPING DOTS ═══════════════ */
function TypingDots() {
  return (
    <span className="flex gap-1.5 items-center py-1 px-1">
      <span className="dot" /><span className="dot" /><span className="dot" />
    </span>
  )
}

/* ═══════════════ CHAT BUBBLE ═══════════════ */
function ChatBubble({ from, children }: { from: 'asya' | 'user'; children: React.ReactNode }) {
  const isAsya = from === 'asya'
  return (
    <div className="flex msg-in" style={{ justifyContent: isAsya ? 'flex-start' : 'flex-end', marginTop: 8 }}>
      <div style={{
        maxWidth: '78%', padding: '12px 16px',
        borderRadius: isAsya ? '18px 18px 18px 6px' : '18px 18px 6px 18px',
        background: isAsya ? T.glassStrong : 'linear-gradient(135deg, #C8B8E8, #B8CCE8)',
        backdropFilter: isAsya ? 'blur(14px)' : undefined,
        WebkitBackdropFilter: isAsya ? 'blur(14px)' : undefined,
        border: isAsya ? `1px solid ${T.glassEdge}` : 'none',
        boxShadow: isAsya
          ? '0 6px 16px rgba(94,88,140,0.10), inset 0 1px 0 rgba(255,255,255,0.7)'
          : '0 8px 18px rgba(140,120,200,0.25)',
        fontSize: 14, lineHeight: 1.5,
        color: isAsya ? T.ink : '#FFFFFF',
        fontWeight: isAsya ? 400 : 500,
      }}>{children}</div>
    </div>
  )
}

/* ═══════════════ OPTION CHIPS ═══════════════ */
function OptionChips({ options, onSelect }: { options: string[]; onSelect: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2" style={{ marginLeft: 2 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)} className="chip" style={{ fontSize: 13 }}>{opt}</button>
      ))}
    </div>
  )
}

/* ═══════════════ PRODUCT CARD ═══════════════ */
function ProductCard({ product, type = 'gold', coupon, onSave, saved }: {
  product: ProductData; type?: string; coupon?: string
  onSave?: (p: ProductData) => void; saved?: boolean
}) {
  const labels: Record<string, string> = { gold: 'Sizin İçin Seçildi', elegancia: 'Elegancia Premium', home: 'Oda Kokusu', gift: 'Hediye Önerisi' }
  return (
    <div className="product-card max-w-sm msg-in">
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <span className="asya-badge">{labels[type] || labels.gold}</span>
        {onSave && type !== 'home' && (
          <button onClick={() => onSave(product)} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all"
            style={saved
              ? { background: 'rgba(185,165,232,0.15)', color: '#5E5878', border: '1px solid rgba(185,165,232,0.3)' }
              : { background: 'rgba(0,0,0,0.04)', color: '#8A85A1', border: '1px solid rgba(0,0,0,0.08)' }}>
            {saved ? I.heartFill : I.heart}
            <span>{saved ? 'Gardırobumda' : 'Kaydet'}</span>
          </button>
        )}
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-20 h-24 object-cover rounded-2xl" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} />
            : <div className="w-20 h-24 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #E2D6F1, #FFFFFF)' }}><BottleGlyph size={36} hue="#E2D6F1" /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-medium text-[14px] leading-snug" style={{ color: T.ink }}>{product.name}</p>
          {(product.top_notes?.length || product.heart_notes?.length) ? (
            <div className="mt-2 space-y-1">
              {product.top_notes?.length ? <p className="text-[11px]" style={{ color: T.inkSoft }}><span style={{ color: T.inkMuted }}>Üst · </span>{product.top_notes.slice(0,3).join(', ')}</p> : null}
              {product.heart_notes?.length ? <p className="text-[11px]" style={{ color: T.inkSoft }}><span style={{ color: T.inkMuted }}>Kalp · </span>{product.heart_notes.slice(0,3).join(', ')}</p> : null}
              {product.base_notes?.length ? <p className="text-[11px]" style={{ color: T.inkSoft }}><span style={{ color: T.inkMuted }}>Alt · </span>{product.base_notes.slice(0,3).join(', ')}</p> : null}
            </div>
          ) : null}
          {coupon && (
            <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(185,165,232,0.10), rgba(159,180,224,0.10))', border: '1px solid rgba(185,165,232,0.25)' }}>
              <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#5E5878' }}>%10 İndirim Kodunuz</p>
              <p className="font-mono font-bold tracking-widest text-[13px] mt-0.5" style={{ color: T.ink }}>{coupon}</p>
            </div>
          )}
          <a href={product.web_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 text-[12px] px-4 py-2 inline-flex items-center gap-1.5" style={{ padding: '8px 16px', fontSize: 12 }}>
            {type === 'home' ? 'İncele' : 'Hemen İncele'} {I.external}
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 1: WELCOME
═══════════════════════════════════════════════════════ */
function ScreenWelcome({ onAdvance }: { onAdvance: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const onDown = (e: React.PointerEvent) => { setDragging(true); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return
    const r = trackRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(r.width - 62, e.clientX - r.left - 31))
    setDragX(x)
  }
  const onUp = () => {
    if (!trackRef.current) return setDragging(false)
    const r = trackRef.current.getBoundingClientRect()
    if (dragX > r.width - 62 - 8) { setDragX(r.width - 62); setTimeout(() => { onAdvance(); setDragX(0) }, 160) }
    else setDragX(0)
    setDragging(false)
  }

  return (
    <div className="fixed inset-0 asya-bg flex flex-col items-center" style={{ paddingTop: 80 }}>
      <div className="blob-extra" />

      <p className="fade-up text-[11px] tracking-[0.28em] uppercase font-medium" style={{ color: T.inkMuted, position: 'relative', zIndex: 2 }}>
        Elegance VIP · Koku Asistanı
      </p>

      {/* Portrait */}
      <div className="fade-up relative z-10 mt-8" style={{ width: 280, height: 360, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animationDelay: '0.1s' }}>
        <div style={{ position: 'absolute', inset: -32, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 35%, rgba(244,238,252,0.90), transparent 65%)', filter: 'blur(14px)' }} />
        <div className="floating relative z-10" style={{ width: 240, height: 320, borderRadius: 28, boxShadow: '0 30px 60px rgba(94,88,140,0.18), 0 0 0 1px rgba(255,255,255,0.6)', overflow: 'hidden', background: 'linear-gradient(160deg, #F0E9F7, #E3ECF5)' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AsyaPortrait size={220} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, background: 'linear-gradient(to bottom, transparent, #FAFAFE 95%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <h1 className="fade-up font-serif font-light text-center mt-4" style={{ fontSize: 44, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.1, animationDelay: '0.15s', position: 'relative', zIndex: 2 }}>
        ASYA ile Tanışın
      </h1>
      <p className="fade-up text-[13px] tracking-[0.18em] uppercase font-medium mt-1" style={{ color: T.inkSoft, animationDelay: '0.2s', position: 'relative', zIndex: 2 }}>
        Koku Mimarı
      </p>

      <div className="flex-1" />

      {/* Slide to start */}
      <div ref={trackRef}
        className="fade-up relative z-10"
        style={{
          width: 300, height: 68, marginBottom: 60, borderRadius: 999,
          background: T.glassStrong, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${T.glassEdge}`, boxShadow: T.shadowSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          userSelect: 'none', touchAction: 'none', animationDelay: '0.25s',
        }}>
        <span style={{ fontSize: 14, letterSpacing: '0.20em', color: T.inkSoft, textTransform: 'uppercase', fontWeight: 500, opacity: Math.max(0, 1 - dragX / 110) }}>
          Başlamak için kaydır
        </span>
        <div style={{ position: 'absolute', left: 3, top: 3, height: 62, width: dragX + 62, borderRadius: 999, background: 'linear-gradient(90deg, rgba(185,165,232,0.45), rgba(159,180,224,0.45))', transition: dragging ? 'none' : 'width 0.25s ease', pointerEvents: 'none' }} />
        <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          style={{ position: 'absolute', left: 3 + dragX, top: 3, width: 62, height: 62, borderRadius: '50%', background: 'linear-gradient(145deg, #FFFFFF, #E8E2F0)', boxShadow: T.neoOut, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', transition: dragging ? 'none' : 'left 0.25s ease' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M7 5l6 6-6 6" stroke="#5E5878" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5l6 6-6 6" stroke="#5E5878" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 2: DASHBOARD
═══════════════════════════════════════════════════════ */
const dashTiles = [
  { icon: '✨', title: 'Koku Profilini', titleB: 'Keşfet', desc: '5 soruyla tam koku karakterin', mode: 'koku_testi' },
  { icon: '🔍', title: 'Muadil', titleB: 'Bul', desc: 'Sauvage, Black Opium muadili', mode: 'muadil' },
  { icon: '🎁', title: 'Hediye', titleB: 'Sihirbazı', desc: 'Kime, hangi ortam için?', mode: 'hediye' },
  { icon: '🕯️', title: 'Ev', titleB: 'Kokusu', desc: '130ml Bambu Reed Diffuser', mode: 'ev_kokusu' },
]

function ScreenDashboard({ lead, onStartChat, onShowWardrobe, onShowFaq }: {
  lead: Lead | null; onStartChat: (mode?: string) => void; onShowWardrobe: () => void; onShowFaq: () => void
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-10 fade-up">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: T.glassStrong, backdropFilter: 'blur(14px)', border: `1px solid ${T.glassEdge}`, boxShadow: '0 4px 12px rgba(94,88,140,0.08)', fontSize: 13, fontWeight: 500, color: T.ink }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="#5E5878" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Koku Testi
          </div>
          <div className="flex gap-2">
            <button onClick={onShowWardrobe} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: T.glassStrong, backdropFilter: 'blur(14px)', border: `1px solid ${T.glassEdge}`, boxShadow: '0 4px 12px rgba(94,88,140,0.08)', cursor: 'pointer', color: T.inkSoft }}>
              {I.wardrobe}
            </button>
            <button onClick={onShowFaq} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: T.glassStrong, backdropFilter: 'blur(14px)', border: `1px solid ${T.glassEdge}`, boxShadow: '0 4px 12px rgba(94,88,140,0.08)', cursor: 'pointer', color: T.inkSoft }}>
              {I.info}
            </button>
          </div>
        </div>

        {/* Hero text */}
        <div className="fade-up mb-8" style={{ animationDelay: '0.05s' }}>
          <h1 className="font-serif font-light" style={{ fontSize: 38, lineHeight: 1.1, color: T.ink, letterSpacing: '-0.01em', margin: 0 }}>
            Selam{lead ? `, ${lead.name.split(' ')[0]}` : ''}, Ben{' '}
            <em className="font-serif" style={{ fontStyle: 'italic' }}>ASYA</em>.<br/>
            Bugün ruhunuzu<br/>yansıtacak kokuyu<br/>bulalım.
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: T.inkSoft }}>
            Koku dünyanızı keşfetmek için bir seçenek belirleyin:
          </p>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 gap-3 mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
          {dashTiles.map((t, i) => (
            <button key={i} onClick={() => onStartChat(t.mode)} className="tile p-4 text-left" style={{ height: 110 }}>
              <div className="text-xl mb-2">{t.icon}</div>
              <div className="font-medium text-[14px]" style={{ color: T.ink, lineHeight: 1.2 }}>{t.title}<br/>{t.titleB}</div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => onStartChat()} className="fade-up w-full flex items-center justify-between px-6 rounded-full" style={{ height: 64, background: T.glassStrong, backdropFilter: 'blur(16px)', border: `1px solid ${T.glassEdge}`, boxShadow: T.shadowSoft, cursor: 'pointer', animationDelay: '0.15s' }}>
          <span className="font-medium text-[15px]" style={{ color: T.ink }}>ASYA ile sohbete başla</span>
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #FFFFFF, #E2DAEE)', boxShadow: T.neoOut }}>
            <span style={{ color: T.inkSoft }}>{I.mic}</span>
          </div>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   REGISTER FORM (inside chat)
═══════════════════════════════════════════════════════ */
function RegisterForm({ onSubmit }: { onSubmit: (name: string, email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const valid = name.trim().length >= 2 && /.+@.+\..+/.test(email)

  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!valid) return; setLoading(true); onSubmit(name, email) }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 fade-up">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="asya-avatar-glow inline-flex mb-4 floating">
            <div className="rounded-full overflow-hidden" style={{ width: 72, height: 72 }}><AsyaPortrait size={72} /></div>
          </div>
          <h2 className="font-serif font-light text-[30px]" style={{ color: T.ink }}>
            Önce <em style={{ fontStyle: 'italic' }}>kısaca tanışalım</em>
          </h2>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ color: T.inkSoft }}>
            Size özel koku önerileri ve Koku Gardırobu için adınızı ve e-postanızı paylaşır mısınız?
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="p-6 rounded-3xl space-y-3" style={{ background: T.glassStrong, backdropFilter: 'blur(18px)', border: `1px solid ${T.glassEdge}`, boxShadow: '0 14px 36px rgba(94,88,140,0.14), inset 0 1px 0 rgba(255,255,255,0.85)' }}>
            <div>
              <label className="block text-[10px] tracking-[0.22em] font-semibold mb-1.5" style={{ color: T.inkMuted }}>İSİM</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="örn. Selin Yıldız" className="asya-input" style={{ borderRadius: 14, padding: '13px 16px' }} />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.22em] font-semibold mb-1.5" style={{ color: T.inkMuted }}>E-POSTA</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="selin@örnek.com" className="asya-input" style={{ borderRadius: 14, padding: '13px 16px' }} />
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: T.inkMuted }}>
              🔒 Bilgileriniz yalnızca koku önerileri için kullanılır.
            </p>
          </div>

          <button type="submit" disabled={!valid || loading}
            className="btn-primary w-full mt-4"
            style={!valid ? { background: T.glassStrong, color: T.inkSoft, boxShadow: 'none', opacity: 0.7 } : {}}>
            {loading ? 'Kaydediliyor...' : 'Sohbete Başla →'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 4: KOKU GARDIROBUM
═══════════════════════════════════════════════════════ */
function ScreenWardrobe({ items, onRemove, onStartChat, lead }: {
  items: GardropItem[]; onRemove: (name: string) => void; onStartChat: () => void; lead: Lead | null
}) {
  const userName = lead?.name.split(' ')[0] || 'Koleksiyonunuz'
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 fade-up">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase font-medium mb-1" style={{ color: T.inkMuted }}>{userName}'in Koleksiyonu</p>
            <h1 className="font-serif font-light" style={{ fontSize: 36, color: T.ink, lineHeight: 1.05 }}>
              Koku <em style={{ fontStyle: 'italic' }}>Gardırobum</em>
            </h1>
            <p className="text-[13px] mt-1" style={{ color: T.inkSoft }}>
              {items.length > 0 ? `${items.length} koku kaydedildi` : 'Beğendiğin kokuları buraya kaydet — her zaman ulaşabilirsin.'}
            </p>
          </div>
          {items.length > 0 && <button onClick={onStartChat} className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>Yeni Öneri Al</button>}
        </div>

        {/* Stats */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6 fade-up" style={{ animationDelay: '0.05s' }}>
            {[{ v: items.length, l: 'koku' }, { v: new Set(items.map(i => i.category?.split(' · ')[0] || '?')).size, l: 'aile' }, { v: 3, l: 'mevsim' }].map((s, i) => (
              <div key={i} className="glass-card-sm p-3 text-center">
                <div className="font-serif text-[28px] font-light" style={{ color: T.ink, lineHeight: 1 }}>{s.v}</div>
                <div className="text-[11px] tracking-[0.08em] uppercase mt-1" style={{ color: T.inkMuted }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {items.length === 0 && (
          <div className="glass-card p-12 text-center fade-up">
            <div className="mb-4"><BottleGlyph size={48} hue="#E2D6F1" /></div>
            <p className="font-serif text-[22px] font-light mb-2" style={{ color: T.ink }}>Gardırobunuz boş</p>
            <p className="text-[13px] mb-6 leading-relaxed" style={{ color: T.inkSoft }}>ASYA ile konuşarak size önerilen parfümleri buraya kaydedebilirsiniz.</p>
            <button onClick={onStartChat} className="btn-primary">✨ Koku Keşfine Başla</button>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4 fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex-shrink-0 w-14 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #E2D6F1, #FFFFFF)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)' }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                  : <BottleGlyph size={32} hue="#FFFFFF" />
                }
              </div>
              <div className="flex-1 min-w-0">
                {item.category && <p className="text-[10px] tracking-[0.22em] font-semibold uppercase mb-0.5" style={{ color: T.inkMuted }}>{item.category}</p>}
                <p className="font-serif font-medium text-[18px] leading-snug" style={{ color: T.ink }}>{item.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: T.inkMuted }}>
                  {new Date(item.addedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} eklendi
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href={item.web_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-1.5" style={{ padding: '9px 14px', fontSize: 12 }}>
                  {I.cart} Sepete Ekle
                </a>
                <button onClick={() => onRemove(item.name)} className="w-9 h-9 rounded-full flex items-center justify-center btn-ghost" style={{ padding: 0, color: T.inkMuted }}>
                  {I.trash}
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="glass-card p-5 flex items-center justify-between mt-6 fade-up">
            <div>
              <p className="font-serif text-[16px]" style={{ color: T.ink }}>Daha fazla keşfetmek ister misiniz?</p>
              <p className="text-[12px] mt-0.5" style={{ color: T.inkSoft }}>ASYA yeni öneriler bulabilir.</p>
            </div>
            <button onClick={onStartChat} className="btn-primary flex-shrink-0 ml-4" style={{ fontSize: 13, padding: '10px 20px' }}>Devam Et →</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 5: KOKU PROFİLİ
═══════════════════════════════════════════════════════ */
function ScreenProfile({ lead, onBack, coupon }: { lead: Lead | null; onBack: () => void; coupon?: string | null }) {
  const name = lead?.name.split(' ')[0] || 'Siz'
  const families = [
    { label: 'Çiçeksi', pct: 38, color: '#C8B8E8' },
    { label: 'Oryantal', pct: 24, color: '#B8CCE8' },
    { label: 'Odunsu', pct: 20, color: '#C8D8E8' },
    { label: 'Aromatik', pct: 12, color: '#D8C8E8' },
    { label: 'Citrus', pct: 6, color: '#E8D8C8' },
  ]
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8 fade-up">
          <GlassPill onClick={onBack} icon={I.back}>Geri</GlassPill>
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase font-medium" style={{ color: T.inkMuted }}>Koku Portreniz</p>
            <h1 className="font-serif font-light text-[30px]" style={{ color: T.ink }}>
              {name}'in <em style={{ fontStyle: 'italic' }}>Koku Profili</em>
            </h1>
          </div>
        </div>

        {/* Olfaktif aile grafiği */}
        <div className="glass-card p-6 mb-5 fade-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-4" style={{ color: T.inkMuted }}>Olfaktif Ailelerin</p>
          <div className="space-y-3">
            {families.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-[13px] font-medium w-20 flex-shrink-0" style={{ color: T.inkSoft }}>{f.label}</div>
                <div className="flex-1 h-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.pct}%`, background: `linear-gradient(90deg, ${f.color}, ${f.color}bb)` }} />
                </div>
                <div className="text-[12px] font-medium w-8 text-right" style={{ color: T.ink }}>{f.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kupon */}
        {coupon && (
          <div className="fade-up mb-5 p-5 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4a3870, #2e4a70)', animationDelay: '0.1s' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.15), transparent 60%)', pointerEvents: 'none' }} />
            <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ASYA'ya Özel Hediye</p>
            <p className="font-serif text-[20px] font-light text-white mb-2">İlk Kokunuzda %10 İndirim</p>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl border border-dashed border-white/30 font-mono font-bold text-[16px] tracking-widest text-white">{coupon}</div>
              <button onClick={() => navigator.clipboard.writeText(coupon)} className="text-[12px] font-medium text-white/80 hover:text-white transition">Kopyala</button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>3 gün geçerli · Tek kullanım</p>
          </div>
        )}

        {/* Oda kokusu cross-sell */}
        <div className="glass-card p-5 fade-up" style={{ animationDelay: '0.15s' }}>
          <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: T.inkMuted }}>Profilinizi Tamamlayın · Ev Koleksiyonu</p>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #E2D6F1, #FFFFFF)' }}>
              <span className="text-2xl">🕯️</span>
            </div>
            <div className="flex-1">
              <div className="asya-badge mb-1">%92 Uyum</div>
              <p className="font-serif text-[17px]" style={{ color: T.ink }}>Ev Kokusu Önerisi</p>
              <p className="text-[12px] mt-1" style={{ color: T.inkSoft }}>Profilinize uygun bambu reed diffuser</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 6: SSS / HAKKIMIZDA
═══════════════════════════════════════════════════════ */
const faqChips = ['Kargo ne kadar sürer?', 'İade koşulları?', 'EDP ile EDT farkı?', 'Numune isteyebilir miyim?', 'Hediye paketi yapıyor musunuz?', 'Kalıcılık nasıl artırılır?', 'VIP üyelik nedir?']

function ScreenFaq({ onBack, onStartChat }: { onBack: () => void; onStartChat: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8 fade-up">
          <GlassPill onClick={onBack} icon={I.back}>Geri</GlassPill>
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase font-medium" style={{ color: T.inkMuted }}>Hakkımızda · SSS</p>
            <h1 className="font-serif font-light text-[30px]" style={{ color: T.ink }}>Bize <em style={{ fontStyle: 'italic' }}>sorun</em>.</h1>
          </div>
        </div>
        <p className="text-[13.5px] leading-relaxed mb-8 fade-up" style={{ color: T.inkSoft, animationDelay: '0.05s' }}>
          Elegance VIP, kargo, üyelik, numune veya niş parfümler hakkında aklınızdaki her soruyu ASYA yanıtlasın.
        </p>
        <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-4 fade-up" style={{ color: T.inkMuted, animationDelay: '0.1s' }}>Popüler Sorular</p>
        <div className="flex flex-wrap gap-2 mb-8 fade-up" style={{ animationDelay: '0.12s' }}>
          {faqChips.map((q, i) => (
            <button key={i} onClick={onStartChat} className="chip" style={{ fontSize: 13 }}>{q}</button>
          ))}
        </div>
        <div className="glass-card p-6 fade-up" style={{ animationDelay: '0.15s' }}>
          <ChatBubble from="user">Elegance VIP üyeliğinin avantajları nedir?</ChatBubble>
          <ChatBubble from="asya">Elegance VIP üyeleri her siparişte %10 koleksiyon indirimi, ücretsiz koku danışmanlığı ve her sezon 2 ücretsiz numune kazanır. 💜</ChatBubble>
          <ChatBubble from="asya">✨ Ayrıca yıllık özel bir parfüm seansına davet edilirsiniz — ister mağazada, ister online.</ChatBubble>
        </div>
        <button onClick={onStartChat} className="btn-primary w-full mt-6 fade-up" style={{ animationDelay: '0.2s' }}>
          ASYA'ya Sor →
        </button>
        <div className="text-center mt-6 fade-up" style={{ animationDelay: '0.22s' }}>
          <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" className="text-[12px] hover:opacity-70 transition" style={{ color: T.inkMuted }}>
            www.elegancevipperfume.com
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [chatPhase, setChatPhase] = useState<'register' | 'chat'>('register')
  const [chatMode, setChatMode] = useState<string>('koku_testi')
  const [lead, setLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [gardrop, setGardrop] = useState<GardropItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try { const s = localStorage.getItem('asya_gardrop'); if (s) setGardrop(JSON.parse(s)) } catch {}
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const saveToGardrop = useCallback((product: ProductData) => {
    setGardrop(prev => {
      if (prev.some(g => g.name === product.name)) return prev
      const updated: GardropItem[] = [{ name: product.name, image_url: product.image_url, web_url: product.web_url, woo_id: product.woo_id, code: product.code, addedAt: new Date().toISOString() }, ...prev]
      try { localStorage.setItem('asya_gardrop', JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const removeFromGardrop = useCallback((name: string) => {
    setGardrop(prev => {
      const updated = prev.filter(g => g.name !== name)
      try { localStorage.setItem('asya_gardrop', JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const isInGardrop = useCallback((name: string) => gardrop.some(g => g.name === name), [gardrop])

  async function handleRegister(name: string, email: string) {
    try {
      const res = await fetch('/api/save-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
      const data = await res.json()
      setLead({ name, email, lead_id: data.lead_id || '', session_id: data.session_id || '' })
    } catch {
      setLead({ name, email, lead_id: '', session_id: '' })
    }
    startChatMessages(chatMode, name)
    setChatPhase('chat')
  }

  function startChatMessages(mode: string, userName?: string) {
    const n = userName || lead?.name.split(' ')[0] || ''
    const intros: Record<string, { text: string; options?: string[] }> = {
      koku_testi: { text: `Tanıştığımıza memnun oldum${n ? `, ${n}` : ''} 💜 Birlikte mükemmel kokuyu bulacağız!\n\nHemen başlayalım — bu parfüm kim için?`, options: ['Kendim için (Kadın)', 'Kendim için (Erkek)', 'Partnerim için (Kadın)', 'Partnerim için (Erkek)'] },
      muadil: { text: `Merhaba${n ? ` ${n}` : ''}! 🔍 Hangi parfümün muadilini arıyorsunuz? Marka ve ismi yazın, hemen bulayım.` },
      hediye: { text: `Çok güzel bir düşünce! 🎁 Birlikte en güzel hediyeyi bulacağız.\n\nKime hediye alıyorsunuz?`, options: ['Kadın için', 'Erkek için', 'Çift hediyesi', 'Sürpriz'] },
      ev_kokusu: { text: `Evinize ruh katacak bir koku arıyoruz 🕯️\n\nHangi ambiyansı yaratmak istersiniz?`, options: ['Ferah & Temiz', 'Çiçeksi & Romantik', 'Odunsu & Cozy', 'Egzotik & Güçlü'] },
    }
    const intro = intros[mode] || { text: 'Nasıl yardımcı olabilirim? 😊' }
    setMessages([{ role: 'assistant', content: intro.text, options: intro.options }])
  }

  function goToChat(mode = 'koku_testi') {
    setChatMode(mode)
    setEmailSent(false)
    if (!lead) { setChatPhase('register'); setScreen('chat'); return }
    setChatPhase('chat')
    startChatMessages(mode)
    setScreen('chat')
  }

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages.map(m => ({ ...m, options: undefined })), userMsg]
    setMessages(updated); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }) })
      const data = await res.json()
      const newMsg: Message = { role: 'assistant', content: data.output || '...', type: data.type, options: data.options }
      if (data.product) newMsg.product = data.product

      if (data.type === 'recommendation' && data.product && lead && !emailSent) {
        setEmailSent(true)
        fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: lead.name, email: lead.email, lead_id: lead.lead_id, session_id: lead.session_id, gold_name: data.product.name, gold_url: data.product.web_url, gold_woo_id: data.product.woo_id, gold_image: data.product.image_url, gold_code: data.product.code, scent_profile: data.scent_profile || {}, scent_story: data.output }) })
          .then(r => r.json()).then(d => { if (d.coupon_code) setCoupon(d.coupon_code) }).catch(() => {})
      }
      setMessages(prev => [...prev, newMsg])
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Bir sorun oluştu, tekrar deneyin 😊' }]) }
    finally { setLoading(false); inputRef.current?.focus() }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }

  const navItems = [
    { id: 'dashboard' as Screen, label: 'Ana Sayfa', icon: I.home },
    { id: 'chat' as Screen, label: 'Sohbet', icon: I.chat, action: () => goToChat() },
    { id: 'wardrobe' as Screen, label: `Gardırobum${gardrop.length > 0 ? ` (${gardrop.length})` : ''}`, icon: I.wardrobe },
    { id: 'profile' as Screen, label: 'Koku Profili', icon: I.profile },
    { id: 'faq' as Screen, label: 'Yardım', icon: I.info },
  ]

  /* ── RENDER ── */
  if (screen === 'welcome') {
    return <ScreenWelcome onAdvance={() => setScreen('dashboard')} />
  }

  return (
    <div className="fixed inset-0 flex flex-col asya-bg">
      <div className="blob-extra" />

      {/* TOP NAV */}
      <nav className="flex-shrink-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <button className="lg:hidden p-1.5 rounded-xl transition" style={{ color: T.inkSoft }} onClick={() => setSidebarOpen(!sidebarOpen)}>{I.menu}</button>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="rounded-full overflow-hidden" style={{ width: 32, height: 32 }}><AsyaPortrait size={32} /></div>
          <div className="hidden sm:block">
            <p className="font-serif font-medium leading-none" style={{ fontSize: 15, color: T.ink }}>ASYA</p>
            <p className="text-[10px] tracking-wider mt-0.5" style={{ color: T.inkMuted }}>Koku Mimarı</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-1 mx-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={item.action ? item.action : () => setScreen(item.id)}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
              style={{ color: screen === item.id ? '#5E5878' : T.inkMuted, background: screen === item.id ? 'rgba(185,165,232,0.12)' : 'transparent', fontFamily: 'var(--font-inter), sans-serif' }}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(185,165,232,0.10)', border: '1px solid rgba(185,165,232,0.20)', color: '#5E5878' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Çevrimiçi
          </div>
          {screen === 'chat' && (
            <button onClick={() => { setMessages([]); setChatPhase('register'); setScreen('dashboard') }} className="btn-ghost text-[12px]" style={{ padding: '8px 14px' }}>
              {I.plus} Yeni
            </button>
          )}
        </div>
      </nav>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && <div className="fixed inset-0 bg-black/15 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-56 flex-shrink-0 transition-transform duration-250 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.5)' }}>
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="asya-avatar-glow floating">
                <div className="rounded-full overflow-hidden" style={{ width: 64, height: 64 }}><AsyaPortrait size={64} /></div>
              </div>
              <div>
                <p className="font-serif font-medium" style={{ fontSize: 16, color: T.ink }}>ASYA</p>
                <p className="text-[11px] mt-0.5" style={{ color: T.inkMuted }}>Koku Mimarı</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { item.action ? item.action() : setScreen(item.id); setSidebarOpen(false) }}
                className={`nav-item ${screen === item.id ? 'active' : ''}`}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.5)' }}>
            <button onClick={() => goToChat()} className="btn-primary w-full" style={{ fontSize: 13, padding: '10px 16px' }}>
              {I.plus} Yeni Konuşma
            </button>
            {lead && (
              <div className="flex items-center gap-2.5 px-2 py-2.5 mt-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: T.accent }}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium truncate" style={{ color: T.ink }}>{lead.name}</p>
                  <p className="text-[10px] truncate" style={{ color: T.inkMuted }}>{lead.email}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">

          {screen === 'dashboard' && (
            <ScreenDashboard lead={lead} onStartChat={goToChat} onShowWardrobe={() => setScreen('wardrobe')} onShowFaq={() => setScreen('faq')} />
          )}

          {screen === 'wardrobe' && (
            <ScreenWardrobe items={gardrop} onRemove={removeFromGardrop} onStartChat={() => goToChat()} lead={lead} />
          )}

          {screen === 'profile' && (
            <ScreenProfile lead={lead} onBack={() => setScreen('dashboard')} coupon={coupon} />
          )}

          {screen === 'faq' && (
            <ScreenFaq onBack={() => setScreen('dashboard')} onStartChat={() => goToChat('soru')} />
          )}

          {screen === 'chat' && (
            <>
              {chatPhase === 'register' ? (
                <RegisterForm onSubmit={handleRegister} />
              ) : (
                <>
                  <div className="flex-1 chat-scroll py-6 px-4">
                    <div className="max-w-xl mx-auto space-y-1">
                      {messages.map((msg, i) => (
                        <div key={i}>
                          {msg.role === 'assistant' ? (
                            <div className="space-y-2">
                              <div className="flex gap-3 items-end">
                                <AsyaAvatar size={30} />
                                <ChatBubble from="asya">{msg.content}</ChatBubble>
                              </div>
                              {msg.options && !msg.product && (
                                <div className="pl-10">
                                  <OptionChips options={msg.options} onSelect={opt => send(opt)} />
                                </div>
                              )}
                              {msg.product && (
                                <div className="pl-10">
                                  <ProductCard product={msg.product} type={msg.type === 'elegancia' ? 'elegancia' : msg.type === 'home' ? 'home' : 'gold'} coupon={msg.type === 'recommendation' ? coupon || undefined : undefined} onSave={msg.type !== 'home' ? saveToGardrop : undefined} saved={isInGardrop(msg.product.name)} />
                                  {msg.type === 'recommendation' && coupon && (
                                    <button onClick={() => setScreen('profile')} className="profile-cta mt-3 w-full max-w-sm flex items-center gap-4 p-4 msg-in" style={{ border: 'none', textAlign: 'left' }}>
                                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}>
                                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="6" stroke="#FFFFFF" strokeWidth="1.6"/><circle cx="11" cy="11" r="9.2" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.6"/><circle cx="11" cy="11" r="1.6" fill="#FFFFFF"/></svg>
                                      </div>
                                      <div className="flex-1 relative z-10">
                                        <div className="text-[10px] tracking-[0.22em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Koku Portreniz Hazır</div>
                                        <div className="font-serif font-light text-[18px] text-white mt-0.5">Koku Profilinizi Görün →</div>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <ChatBubble from="user">{msg.content}</ChatBubble>
                          )}
                        </div>
                      ))}
                      {loading && (
                        <div className="flex gap-3 items-end msg-in">
                          <AsyaAvatar size={30} />
                          <div style={{ padding: '12px 16px', background: T.glassStrong, backdropFilter: 'blur(14px)', border: `1px solid ${T.glassEdge}`, borderRadius: '18px 18px 18px 6px', boxShadow: '0 6px 16px rgba(94,88,140,0.10)' }}>
                            <TypingDots />
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} className="h-1" />
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-4 py-3" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.5)' }}>
                    <div className="flex gap-3 items-end max-w-xl mx-auto">
                      <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                        placeholder="ASYA'ya bir mesaj yazın…" disabled={loading} rows={1} className="chat-input flex-1"
                        style={{ minHeight: 48, maxHeight: 120 }} />
                      <button onClick={() => send(input)} disabled={loading || !input.trim()} className="send-btn">{I.send}</button>
                    </div>
                    <p className="text-center text-[11px] mt-2 hidden lg:block" style={{ color: T.inkMuted }}>
                      Elegance VIP Perfume · ASYA AI ·{' '}
                      <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition" style={{ color: T.inkSoft }}>elegancevipperfume.com</a>
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
