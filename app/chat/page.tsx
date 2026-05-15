'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

/* ─────────────── TYPES ─────────────── */
interface Message {
  role: 'assistant' | 'user'
  content: string
  product?: ProductData
  type?: string
  options?: string[]
}
interface ProductData {
  name: string; image_url: string; web_url: string; woo_id?: number
  top_notes?: string[]; heart_notes?: string[]; base_notes?: string[]; code?: string
}
interface GardropItem {
  name: string
  image_url: string
  web_url: string
  woo_id?: number
  code?: string
  addedAt: string
}
interface Lead { name: string; email: string; lead_id: string; session_id: string }

/* ─────────────── ASYA PORTRAIT ─────────────── */
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
      <path d="M58 57 Q60 62 62 57" stroke="#c4845a" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M52 67 Q56 64 60 65 Q64 64 68 67 Q64 72 60 71 Q56 72 52 67Z" fill="#c0604a"/>
      <path d="M52 67 Q60 65 68 67" stroke="#a04030" strokeWidth="0.8" fill="none"/>
      <circle cx="40" cy="57" r="2.5" fill="#C6862A"/>
      <rect x="39.2" y="59" width="1.6" height="6" rx="0.8" fill="#C6862A"/>
      <circle cx="40" cy="66" r="2" fill="#C6862A"/>
      <circle cx="80" cy="57" r="2.5" fill="#C6862A"/>
      <rect x="79.2" y="59" width="1.6" height="6" rx="0.8" fill="#C6862A"/>
      <circle cx="80" cy="66" r="2" fill="#C6862A"/>
      <ellipse cx="44" cy="58" rx="6" ry="3" fill="#e89070" opacity="0.2"/>
      <ellipse cx="76" cy="58" rx="6" ry="3" fill="#e89070" opacity="0.2"/>
    </svg>
  )
}

function AsyaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size, boxShadow: '0 0 12px rgba(198,134,42,0.2)' }}>
      <AsyaPortrait size={size} />
    </div>
  )
}

/* ─────────────── ICONS ─────────────── */
const I = {
  send:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  menu:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  chat:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  gift:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  search:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  heart:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill:<svg width="15" height="15" viewBox="0 0 24 24" fill="#C6862A" stroke="#C6862A" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  spray:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3h4v14H3z"/><path d="M7 6h6v11H7"/><path d="M13 8h3l2 9h-5"/><path d="M16 8V6l2-2"/><path d="M18 4h2"/><path d="M19 3v2"/></svg>,
  note:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  external: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  trash:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  cart:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  wardrobe: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M8 10h1M15 10h1"/></svg>,
}

/* ─────────────── LEAD FORM ─────────────── */
function LeadForm({ onSubmit }: { onSubmit: (n: string, e: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!name || !email) return
    setLoading(true)
    onSubmit(name, email)
  }
  return (
    <div className="glass-card p-6 max-w-sm fade-up">
      <p className="font-serif text-[18px] font-light text-[#1a1a1a] mb-1">Küçük bir rica ✨</p>
      <p className="text-[13px] text-[#6b6560] mb-5 leading-relaxed">
        Adınız ve e-postanızla size özel koku profilinizi ve <strong>%10 indirim kodunuzu</strong> maille göndereyim.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" className="chat-input" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz" className="chat-input" required />
        <button type="submit" disabled={loading || !name || !email} className="btn-luxury btn-gold w-full justify-center py-3 disabled:opacity-40">
          {loading ? 'Kaydediliyor...' : 'Devam Et →'}
        </button>
      </form>
      <p className="text-center text-[11px] text-[#b5afa8] mt-4">🔒 Bilgileriniz güvende · Spam yok</p>
    </div>
  )
}

/* ─────────────── PRODUCT CARD ─────────────── */
function ProductCard({
  product, type = 'gold', coupon, onSave, saved,
}: {
  product: ProductData; type?: string; coupon?: string
  onSave?: (p: ProductData) => void; saved?: boolean
}) {
  const labels: Record<string, string> = {
    gold: 'Sizin İçin Seçildi',
    elegancia: 'Elegancia Premium',
    home: 'Oda Kokusu Önerisi',
    gift: 'Hediye Önerisi',
  }
  return (
    <div className="product-card max-w-sm">
      <div className="px-4 py-2.5 border-b border-white/40 flex items-center justify-between">
        <span className="gold-badge">{labels[type] || labels.gold}</span>
        {onSave && type !== 'home' && (
          <button
            onClick={() => onSave(product)}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all"
            style={saved
              ? { background: 'rgba(198,134,42,0.12)', color: '#C6862A', border: '1px solid rgba(198,134,42,0.3)' }
              : { background: 'rgba(0,0,0,0.04)', color: '#6b6560', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            {saved ? <>{I.check} <span>Gardırobumda</span></> : <>{I.heart} <span>Gardıroba Ekle</span></>}
          </button>
        )}
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-20 h-24 object-cover rounded-2xl" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} />
            : <div className="w-20 h-24 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-2xl">
                {type === 'home' ? '🕯️' : '🌸'}
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-medium text-[#1a1a1a] text-[14px] leading-snug">{product.name}</p>
          {(product.top_notes?.length || product.heart_notes?.length) ? (
            <div className="mt-2 space-y-1">
              {product.top_notes?.length ? <p className="text-[11px] text-[#6b6560]"><span className="text-[#b5afa8]">Üst · </span>{product.top_notes.slice(0,3).join(', ')}</p> : null}
              {product.heart_notes?.length ? <p className="text-[11px] text-[#6b6560]"><span className="text-[#b5afa8]">Kalp · </span>{product.heart_notes.slice(0,3).join(', ')}</p> : null}
              {product.base_notes?.length ? <p className="text-[11px] text-[#6b6560]"><span className="text-[#b5afa8]">Alt · </span>{product.base_notes.slice(0,3).join(', ')}</p> : null}
            </div>
          ) : null}
          {coupon && (
            <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(198,134,42,0.08), rgba(224,160,64,0.08))', border: '1px solid rgba(198,134,42,0.2)' }}>
              <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#C6862A' }}>%10 İndirim Kodunuz</p>
              <p className="font-mono font-bold tracking-widest text-[13px] text-[#1a1a1a] mt-0.5">{coupon}</p>
            </div>
          )}
          <a href={product.web_url} target="_blank" rel="noopener noreferrer"
            className="btn-luxury btn-gold mt-3 text-[12px] px-4 py-2 inline-flex items-center gap-1.5">
            {type === 'home' ? 'İncele' : 'Hemen İncele'} {I.external}
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── OPTION BUTTONS ─────────────── */
function OptionButtons({ options, onSelect }: { options: string[]; onSelect: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2 pl-[44px]">
      {options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)} className="chip">{opt}</button>
      ))}
    </div>
  )
}

/* ─────────────── KOKU GARDIROBU VIEW ─────────────── */
function GardropView({
  items,
  onRemove,
  onStartChat,
}: {
  items: GardropItem[]
  onRemove: (name: string) => void
  onStartChat: (mode: string) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-up">
          <div>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase mb-1" style={{ color: '#C6862A' }}>
              Koleksiyonunuz
            </p>
            <h1 className="font-serif text-[28px] sm:text-[32px] font-light text-[#1a1a1a] leading-none">
              Koku Gardırobum
            </h1>
            <p className="text-[#6b6560] text-[13px] mt-1">
              {items.length > 0 ? `${items.length} ürün kaydedildi` : 'Henüz ürün eklenmedi'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => onStartChat('koku_testi')}
              className="btn-luxury btn-gold text-[13px]"
            >
              ✨ Yeni Öneri Al
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="glass-card p-12 text-center fade-up">
            <div className="text-5xl mb-4">👜</div>
            <p className="font-serif text-[20px] font-light text-[#1a1a1a] mb-2">Gardırobunuz boş</p>
            <p className="text-[13px] text-[#6b6560] mb-6 max-w-xs mx-auto">
              ASYA ile konuşarak size önerilen parfümleri buraya kaydedebilirsiniz.
            </p>
            <button onClick={() => onStartChat('koku_testi')} className="btn-luxury btn-gold">
              ✨ Koku Keşfine Başla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <div key={i} className="glass-card overflow-hidden fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                {/* Product image */}
                <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-50">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => onRemove(item.name)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    title="Kaldır"
                  >
                    <span style={{ color: '#9b8b7a' }}>{I.trash}</span>
                  </button>
                  {/* Code badge */}
                  {item.code && (
                    <div className="absolute bottom-3 left-3">
                      <span className="gold-badge">{item.code}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-serif font-medium text-[#1a1a1a] text-[14px] leading-snug mb-1">{item.name}</p>
                  <p className="text-[11px] text-[#b5afa8] mb-4">
                    {new Date(item.addedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} tarihinde eklendi
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={item.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-luxury btn-gold flex-1 justify-center text-[12px] py-2"
                    >
                      {I.cart} Sepete Ekle
                    </a>
                    <button
                      onClick={() => onRemove(item.name)}
                      className="btn-luxury btn-ghost px-3 py-2 text-[12px]"
                      title="Kaldır"
                    >
                      {I.trash}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {items.length > 0 && (
          <div className="mt-8 glass-card p-5 flex items-center justify-between fade-up">
            <div>
              <p className="font-serif text-[16px] text-[#1a1a1a]">Daha fazla keşfetmek ister misiniz?</p>
              <p className="text-[12px] text-[#6b6560] mt-0.5">ASYA yeni profil soruları sorarak başka öneriler de bulabilir.</p>
            </div>
            <button onClick={() => onStartChat('koku_testi')} className="btn-luxury btn-gold flex-shrink-0 ml-4">
              ✨ Devam Et
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   HOME BENTO
═══════════════════════════════════════════════════════ */
function HomeScreen({
  lead,
  gardrop,
  onStartMode,
  onShowLead,
  onShowGardrop,
}: {
  lead: Lead | null
  gardrop: GardropItem[]
  onStartMode: (mode: string) => void
  onShowLead: () => void
  onShowGardrop: () => void
}) {
  function go(mode: string) {
    if (!lead) { onShowLead(); return }
    onStartMode(mode)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ASYA Hero */}
        <div className="flex items-center gap-5 mb-8 fade-up">
          <div className="asya-avatar-glow floating">
            <div className="w-16 h-16 rounded-full overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(198,134,42,0.20)' }}>
              <AsyaPortrait size={64} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase mb-1" style={{ color: '#C6862A' }}>
              Elegance VIP Perfume
            </p>
            <h1 className="font-serif text-[28px] sm:text-[34px] font-light text-[#1a1a1a] leading-none">
              Merhaba{lead ? `, ${lead.name.split(' ')[0]}` : ''}! ✨
            </h1>
            <p className="text-[#6b6560] text-[14px] mt-1">Bugün size nasıl bir koku eşliği yapabilirim?</p>
          </div>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 mb-7 fade-up" style={{ animationDelay: '0.1s' }}>
          {[
            { label: '🌸 Günlük & hafif', mode: 'koku_testi' },
            { label: '🌙 Akşam & gece', mode: 'koku_testi' },
            { label: '💼 İş & ofis', mode: 'koku_testi' },
            { label: '🎁 Hediye seç', mode: 'hediye' },
            { label: '🔍 Muadil sorgula', mode: 'muadil' },
            { label: '🕯️ Ev kokusu', mode: 'ev_kokusu' },
          ].map(c => (
            <button key={c.label} className="chip" onClick={() => go(c.mode)}>{c.label}</button>
          ))}
        </div>

        {/* BENTO GRID */}
        <div className="bento-grid fade-up" style={{ animationDelay: '0.2s' }}>

          {/* Featured: Koku Profili */}
          <div className="bento-featured glass-card p-6 cursor-pointer"
            onClick={() => go('koku_testi')}
            style={{ background: 'linear-gradient(135deg, rgba(255,249,245,0.9) 0%, rgba(255,248,240,0.85) 100%)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, rgba(198,134,42,0.12), rgba(224,160,64,0.08))' }}>
                ✨
              </div>
              <span className="text-[11px] text-[#b5afa8] font-medium">5 Soru · 2 dk</span>
            </div>
            <p className="font-serif text-[22px] font-light text-[#1a1a1a] leading-snug mb-2">
              Koku Profilini<br/>Keşfet
            </p>
            <p className="text-[13px] text-[#6b6560] leading-relaxed mb-5">
              5 kısa soruyla tam koku karakterini bulalım. Odunsu & Maskülen mi, Çiçeksi & Modern mi — seninle konuşarak anlıyorum.
            </p>
            <div className="flex gap-2 flex-wrap mb-5">
              {['Fresh', 'Odunsu', 'Çiçeksi', 'Oriental', 'Gourmand'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-[11px] border"
                  style={{ borderColor: 'rgba(198,134,42,0.2)', color: '#C6862A', background: 'rgba(198,134,42,0.05)' }}>
                  {t}
                </span>
              ))}
            </div>
            <button className="btn-luxury btn-gold" onClick={e => { e.stopPropagation(); go('koku_testi') }}>
              Teste Başla →
            </button>
          </div>

          {/* Muadil */}
          <div className="bento-side glass-card p-6 cursor-pointer" onClick={() => go('muadil')}
            style={{ background: 'rgba(248,250,255,0.85)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
              style={{ background: 'rgba(99,102,241,0.08)' }}>
              🔍
            </div>
            <p className="font-serif text-[20px] font-light text-[#1a1a1a] mb-2">Muadil Sorgula</p>
            <p className="text-[13px] text-[#6b6560] leading-relaxed mb-4">
              Sauvage mı, Black Opium mu? Sevdiğin lüks parfümün en yakın karşılığını anında buluyorum.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-[#b5afa8]"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
              {I.search} <span>Parfüm adı yaz...</span>
            </div>
          </div>

          {/* Hediye */}
          <div className="bento-third glass-card p-5 cursor-pointer" onClick={() => go('hediye')}
            style={{ background: 'linear-gradient(135deg, rgba(255,245,250,0.90), rgba(255,240,248,0.85))' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: 'rgba(236,72,153,0.06)' }}>
              🎁
            </div>
            <p className="font-serif text-[17px] font-light text-[#1a1a1a] mb-1">Hediye Sihirbazı</p>
            <p className="text-[12px] text-[#6b6560] mb-3">Kime, hangi durum? Nokta atışı öneri.</p>
            <button className="btn-luxury btn-ghost text-[12px] px-3 py-2">Başla →</button>
          </div>

          {/* Ev Kokusu */}
          <div className="bento-third glass-card p-5 cursor-pointer" onClick={() => go('ev_kokusu')}
            style={{ background: 'linear-gradient(135deg, rgba(255,252,240,0.90), rgba(255,249,230,0.85))' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: 'rgba(234,179,8,0.08)' }}>
              🕯️
            </div>
            <p className="font-serif text-[17px] font-light text-[#1a1a1a] mb-1">Ev Kokusu Bul</p>
            <p className="text-[12px] text-[#6b6560] mb-3">130ml Bambu Reed Diffuser — evinize ruh katın.</p>
            <button className="btn-luxury btn-ghost text-[12px] px-3 py-2">Keşfet →</button>
          </div>

          {/* Gardrop */}
          <div className="bento-third glass-card p-5 cursor-pointer" onClick={onShowGardrop}
            style={{ background: 'rgba(248,255,252,0.85)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: 'rgba(34,197,94,0.07)' }}>
              👜
            </div>
            <p className="font-serif text-[17px] font-light text-[#1a1a1a] mb-1">Koku Gardırobum</p>
            {gardrop.length > 0 ? (
              <div className="space-y-1.5">
                {gardrop.slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-[#6b6560]">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C6862A' }} />
                    <span className="truncate">{g.name}</span>
                  </div>
                ))}
                {gardrop.length > 3 && (
                  <p className="text-[11px] text-[#b5afa8]">+{gardrop.length - 3} ürün daha</p>
                )}
                <button className="btn-luxury btn-ghost text-[12px] px-3 py-1.5 mt-1">Tümünü Gör →</button>
              </div>
            ) : (
              <p className="text-[12px] text-[#b5afa8]">Beğendiğin kokuları buraya kaydet</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [phase, setPhase] = useState<'home' | 'lead' | 'chat' | 'gardrop'>('home')
  const [activeNav, setActiveNav] = useState('asistan')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState<string | null>(null)
  const [gardrop, setGardrop] = useState<GardropItem[]>([])
  const [emailSent, setEmailSent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load gardrop from localStorage on mount (avoid SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('asya_gardrop')
      if (saved) setGardrop(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const saveToGardrop = useCallback((product: ProductData) => {
    setGardrop(prev => {
      if (prev.some(g => g.name === product.name)) return prev
      const updated: GardropItem[] = [
        { name: product.name, image_url: product.image_url, web_url: product.web_url, woo_id: product.woo_id, code: product.code, addedAt: new Date().toISOString() },
        ...prev,
      ]
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

  async function handleLead(name: string, email: string) {
    try {
      const res = await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      const newLead: Lead = { name, email, lead_id: data.lead_id, session_id: data.session_id }
      setLead(newLead)
      if (pendingMode) { startMode(pendingMode, newLead); setPendingMode(null) }
      else setPhase('home')
    } catch {
      // fallback — still proceed
      const newLead: Lead = { name, email, lead_id: '', session_id: '' }
      setLead(newLead)
      if (pendingMode) { startMode(pendingMode, newLead); setPendingMode(null) }
      else setPhase('home')
    }
  }

  function startMode(mode: string, resolvedLead?: Lead) {
    const activeLead = resolvedLead || lead
    if (!activeLead) { setPendingMode(mode); setPhase('lead'); return }
    setPhase('chat')
    setSidebarOpen(false)
    setEmailSent(false)
    setActiveNav(mode === 'hediye' ? 'hediye' : mode === 'muadil' ? 'muadil' : mode === 'gardrop' ? 'gardrop' : 'asistan')

    const intros: Record<string, { text: string; options?: string[] }> = {
      koku_testi: {
        text: `Harika, seninle birlikte mükemmel kokuyu bulacağız! ✨\n\nHemen başlayalım — bu parfüm kim için?`,
        options: ['Kendim için (Kadın)', 'Kendim için (Erkek)', 'Partnerim için (Kadın)', 'Partnerim için (Erkek)'],
      },
      muadil: {
        text: 'Hangi parfümün muadilini arıyorsun? 🔍 Marka ve ismi yaz, katalogumuzdan en yakın alternatifi saniyeler içinde bulayım.',
      },
      soru: {
        text: 'Parfümler hakkında ne merak ediyorsun? EDP/EDT farkı, kalıcılık, mevsim seçimi — her şeyi sorabilirsin! 😊',
      },
      hediye: {
        text: 'Ne güzel bir düşünce! 🎁 Çok doğru kişiye geldik — birlikte mükemmel hediyeyi bulacağız.\n\nKime hediye alıyorsunuz?',
        options: ['Kadın için', 'Erkek için', 'Çift hediyesi', 'Sürpriz — fark etmez'],
      },
      ev_kokusu: {
        text: 'Evinize kişilik katacak bir koku arıyoruz 🕯️ Harika!\n\nEvinizde hangi ambiyansı yaratmak istersiniz?',
        options: ['Ferah & Temiz', 'Çiçeksi & Romantic', 'Odunsu & Cozy', 'Egzotik & Güçlü'],
      },
    }
    const intro = intros[mode] || { text: 'Nasıl yardımcı olabilirim? 😊' }
    setMessages([{ role: 'assistant', content: intro.text, options: intro.options }])
  }

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages.map(m => ({ ...m, options: undefined })), userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()

      const newMsg: Message = {
        role: 'assistant',
        content: data.output || '...',
        type: data.type,
        options: data.options,
      }

      if (data.product && (data.type === 'recommendation' || data.type === 'elegancia' || data.type === 'home')) {
        newMsg.product = data.product
      }

      // Trigger email on first Gold recommendation
      if (data.type === 'recommendation' && data.product && lead && !emailSent) {
        setEmailSent(true)
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: lead.name,
            email: lead.email,
            lead_id: lead.lead_id,
            session_id: lead.session_id,
            gold_name: data.product.name,
            gold_url: data.product.web_url,
            gold_woo_id: data.product.woo_id,
            gold_image: data.product.image_url,
            gold_code: data.product.code,
            scent_profile: data.scent_profile || {},
            scent_story: data.output,
          }),
        })
          .then(r => r.json())
          .then(d => { if (d.coupon_code) setCoupon(d.coupon_code) })
          .catch(() => {})
      }

      setMessages(prev => [...prev, newMsg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bir sorun oluştu, tekrar deneyin 😊' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function newChat() {
    setMessages([])
    setPhase('home')
    setInput('')
    setCoupon(null)
    setEmailSent(false)
    setActiveNav('asistan')
    setSidebarOpen(false)
  }

  const navItems = [
    { id: 'asistan', label: 'Asistan', icon: I.chat, action: () => { setActiveNav('asistan'); newChat() } },
    { id: 'hediye', label: 'Hediye Sihirbazı', icon: I.gift, action: () => startMode('hediye') },
    { id: 'muadil', label: 'Muadil Bul', icon: I.search, action: () => startMode('muadil') },
    { id: 'ev_kokusu', label: 'Ev Kokusu', icon: I.note, action: () => startMode('ev_kokusu') },
    {
      id: 'gardrop',
      label: `Gardırobum${gardrop.length > 0 ? ` (${gardrop.length})` : ''}`,
      icon: I.wardrobe,
      action: () => { setActiveNav('gardrop'); setPhase('gardrop'); setSidebarOpen(false) },
    },
    { id: 'katalog', label: 'Ürünlerimiz', icon: I.spray, action: () => window.open('https://www.elegancevipperfume.com', '_blank') },
  ]

  /* ── RENDER ── */
  return (
    <div className="fixed inset-0 flex flex-col luxury-bg">

      {/* TOP NAV */}
      <nav className="flex-shrink-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>

        <button className="lg:hidden p-1.5 rounded-xl text-[#6b6560] transition hover:bg-white/60" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {I.menu}
        </button>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden" style={{ boxShadow: '0 0 12px rgba(198,134,42,0.2)' }}>
            <AsyaPortrait size={32} />
          </div>
          <div className="hidden sm:block">
            <p className="font-serif text-[15px] font-medium text-[#1a1a1a] leading-none">ASYA</p>
            <p className="text-[10px] tracking-wider text-[#b5afa8] mt-0.5">Koku Mimarı</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-0.5 mx-auto">
          {[
            { l: 'Ana Sayfa', fn: newChat },
            { l: 'Muadil Bul', fn: () => startMode('muadil') },
            { l: 'Hediye Seç', fn: () => startMode('hediye') },
            { l: 'Koku Testi', fn: () => startMode('koku_testi') },
            { l: `Gardırobum${gardrop.length > 0 ? ` (${gardrop.length})` : ''}`, fn: () => { setActiveNav('gardrop'); setPhase('gardrop') } },
          ].map(item => (
            <button key={item.l} onClick={item.fn}
              className="px-4 py-2 rounded-xl text-[13px] text-[#6b6560] font-medium transition-all hover:bg-white/60 hover:text-[#C6862A]">
              {item.l}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(198,134,42,0.08)', border: '1px solid rgba(198,134,42,0.15)', color: '#C6862A' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Çevrimiçi
          </div>
          {phase === 'chat' && (
            <button onClick={newChat} className="btn-luxury btn-ghost text-[12px] px-3 py-1.5 gap-1.5">
              {I.plus} Yeni
            </button>
          )}
        </div>
      </nav>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-56 flex-shrink-0 transition-transform duration-250 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.5)' }}>

          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="asya-avatar-glow">
                <div className="w-16 h-16 rounded-full overflow-hidden"><AsyaPortrait size={64} /></div>
              </div>
              <div>
                <p className="font-serif text-[16px] font-medium text-[#1a1a1a]">ASYA</p>
                <p className="text-[11px] text-[#b5afa8] mt-0.5">Koku Mimarı</p>
                <p className="text-[10px] text-[#b5afa8]">Elegance VIP Perfume</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={item.action} className="nav-item w-full"
                style={activeNav === item.id ? { color: '#C6862A', background: 'rgba(198,134,42,0.08)' } : {}}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.5)' }}>
            <button onClick={newChat} className="btn-luxury btn-gold w-full justify-center py-2.5 text-[13px]">
              {I.plus} Yeni Konuşma
            </button>
            {lead && (
              <div className="flex items-center gap-2.5 px-2 py-2.5 mt-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C6862A, #e0a040)' }}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{lead.name}</p>
                  <p className="text-[10px] text-[#b5afa8] truncate">{lead.email}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* HOME */}
          {phase === 'home' && (
            <HomeScreen
              lead={lead}
              gardrop={gardrop}
              onStartMode={startMode}
              onShowLead={() => setPhase('lead')}
              onShowGardrop={() => { setActiveNav('gardrop'); setPhase('gardrop') }}
            />
          )}

          {/* GARDROP */}
          {phase === 'gardrop' && (
            <GardropView
              items={gardrop}
              onRemove={removeFromGardrop}
              onStartChat={mode => { setActiveNav('asistan'); startMode(mode) }}
            />
          )}

          {/* LEAD FORM */}
          {phase === 'lead' && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                  <div className="asya-avatar-glow inline-block mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto"><AsyaPortrait size={80} /></div>
                  </div>
                  <p className="font-serif text-[24px] font-light text-[#1a1a1a]">Merhaba!</p>
                  <p className="text-[13px] text-[#6b6560] mt-1">Sizi tanıyalım 🌸</p>
                </div>
                <LeadForm onSubmit={handleLead} />
                <button onClick={() => setPhase('home')} className="mt-4 w-full text-center text-[12px] text-[#b5afa8] hover:text-[#6b6560] transition">
                  ← Geri dön
                </button>
              </div>
            </div>
          )}

          {/* CHAT */}
          {phase === 'chat' && (
            <>
              <div className="flex-1 chat-scroll py-6 px-4">
                <div className="max-w-2xl mx-auto space-y-5">
                  {messages.map((msg, i) => (
                    <div key={i} className="msg-in">
                      {msg.role === 'assistant' ? (
                        <div className="space-y-2">
                          <div className="flex gap-3 items-end">
                            <AsyaAvatar size={32} />
                            <div className="glass-card px-4 py-3.5 max-w-sm xl:max-w-md"
                              style={{ borderRadius: '20px 20px 20px 6px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                              <p className="text-[#1a1a1a] text-[14px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                          {msg.options && !msg.product && (
                            <OptionButtons options={msg.options} onSelect={opt => send(opt)} />
                          )}
                          {msg.product && (
                            <div className="pl-[44px]">
                              <ProductCard
                                product={msg.product}
                                type={msg.type === 'elegancia' ? 'elegancia' : msg.type === 'home' ? 'home' : 'gold'}
                                coupon={msg.type === 'recommendation' ? coupon || undefined : undefined}
                                onSave={msg.type !== 'home' ? saveToGardrop : undefined}
                                saved={isInGardrop(msg.product.name)}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="px-4 py-3.5 rounded-[20px] rounded-br-[6px] max-w-sm xl:max-w-md"
                            style={{ background: 'linear-gradient(135deg, #C6862A, #d4922e)', boxShadow: '0 4px 16px rgba(198,134,42,0.25)' }}>
                            <p className="text-white text-[14px] leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3 items-end msg-in">
                      <AsyaAvatar size={32} />
                      <div className="glass-card px-4 py-3" style={{ borderRadius: '20px 20px 20px 6px' }}>
                        <div className="flex gap-1 items-center h-4">
                          <span className="dot" /><span className="dot" /><span className="dot" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} className="h-1" />
                </div>
              </div>

              {/* INPUT */}
              <div className="flex-shrink-0 px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.5)' }}>
                <div className="flex gap-2 items-end max-w-2xl mx-auto">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Bir koku veya ruh hali tarif edin..."
                    disabled={loading}
                    rows={1}
                    className="chat-input flex-1"
                    style={{ minHeight: 44, maxHeight: 120 }}
                  />
                  <button onClick={() => send(input)} disabled={loading || !input.trim()} className="send-btn">
                    {I.send}
                  </button>
                </div>
                <p className="text-center text-[11px] text-[#b5afa8] mt-2 hidden lg:block">
                  Elegance VIP Perfume · ASYA AI ·{' '}
                  <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer"
                    className="hover:opacity-70 transition" style={{ color: '#C6862A' }}>
                    elegancevipperfume.com
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
