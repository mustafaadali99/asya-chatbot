'use client'
import { useState, useRef, useEffect } from 'react'

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

function AyaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size, boxShadow: '0 0 12px rgba(198,134,42,0.2)' }}>
      <AsyaPortrait size={size} />
    </div>
  )
}

/* ─────────────── ICONS ─────────────── */
const I = {
  send:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  menu:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>,
  back:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>,
  plus:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  chat:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  gift:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  star:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  note:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  heart:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  spray:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3h4v14H3z"/><path d="M7 6h6v11H7"/><path d="M13 8h3l2 9h-5"/><path d="M16 8V6l2-2"/><path d="M18 4h2"/><path d="M19 3v2"/></svg>,
  external: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
}

/* ─────────────── LEAD FORM ─────────────── */
function LeadForm({ onSubmit }: { onSubmit: (n: string, e: string) => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false)
  const submit = (ev: React.FormEvent) => { ev.preventDefault(); if (!name || !email) return; setLoading(true); onSubmit(name, email) }
  return (
    <div className="glass-card p-6 max-w-sm fade-up">
      <p className="font-serif text-[18px] font-light text-[#1a1a1a] mb-1">Küçük bir rica</p>
      <p className="text-[13px] text-[#6b6560] mb-5 leading-relaxed">Adınız ve e-postanızla size özel koku profilinizi ve indirim kodunuzu maille göndereyim.</p>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" className="chat-input" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz" className="chat-input" required />
        <button type="submit" disabled={loading || !name || !email} className="btn-luxury btn-gold w-full justify-center py-3 disabled:opacity-40">
          {loading ? '...' : 'Devam Et →'}
        </button>
      </form>
      <p className="text-center text-[11px] text-[#b5afa8] mt-4">🔒 Bilgileriniz güvende · Spam yok</p>
    </div>
  )
}

/* ─────────────── PRODUCT CARD ─────────────── */
function ProductCard({ product, type = 'gold', coupon }: { product: ProductData; type?: string; coupon?: string }) {
  const labels: Record<string, string> = { gold: 'Sizin İçin Seçildi', elegancia: 'Elegancia Premium', home: 'Oda Kokusu', gift: 'Hediye Önerisi' }
  return (
    <div className="product-card max-w-sm">
      <div className="px-4 py-2.5 border-b border-white/40 flex items-center gap-2">
        <span className="gold-badge">{labels[type] || labels.gold}</span>
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-20 h-24 object-cover rounded-2xl" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }} />
            : <div className="w-20 h-24 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-2xl">{type === 'home' ? '🕯️' : '🌸'}</div>
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
          <a href={product.web_url} target="_blank" rel="noopener noreferrer" className="btn-luxury btn-gold mt-3 text-[12px] px-4 py-2">
            Hemen İncele {I.external}
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

/* ═══════════════════════════════════════════════════════
   HOME BENTO CARDS
═══════════════════════════════════════════════════════ */
function HomeScreen({ lead, onStartMode, onShowLead }: {
  lead: Lead | null
  onStartMode: (mode: string) => void
  onShowLead: () => void
}) {
  const [notaSearch, setNotaSearch] = useState('')
  const [gardrop, setGardrop] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('asya_gardrop') || '[]') } catch { return [] }
  })

  function go(mode: string) { if (!lead) { onShowLead(); return }; onStartMode(mode) }

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
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase mb-1" style={{ color: '#C6862A' }}>Elegance VIP Perfume</p>
            <h1 className="font-serif text-[28px] sm:text-[34px] font-light text-[#1a1a1a] leading-none">
              Merhaba{lead ? `, ${lead.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-[#6b6560] text-[14px] mt-1">Bugün size nasıl bir koku eşliği yapabilirim?</p>
          </div>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 mb-7 fade-up" style={{ animationDelay: '0.1s' }}>
          {[
            { label: '🌸 Günlük hafif koku', mode: 'koku_testi' },
            { label: '🌙 Akşam & gece', mode: 'koku_testi' },
            { label: '💼 İş & ofis', mode: 'koku_testi' },
            { label: '🎁 Hediye seç', mode: 'hediye' },
            { label: '🔍 Muadil sorgula', mode: 'muadil' },
            { label: '❓ EDP vs EDT', mode: 'soru' },
          ].map(c => (
            <button key={c.label} className="chip" onClick={() => go(c.mode)}>{c.label}</button>
          ))}
        </div>

        {/* BENTO GRID */}
        <div className="bento-grid fade-up" style={{ animationDelay: '0.2s' }}>

          {/* ── Featured: Koku Profili ── */}
          <div className="bento-featured glass-card p-6 cursor-pointer group" onClick={() => go('koku_testi')}
            style={{ background: 'linear-gradient(135deg, rgba(255,249,245,0.9) 0%, rgba(255,248,240,0.85) 100%)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, rgba(198,134,42,0.12), rgba(224,160,64,0.08))' }}>
                ✨
              </div>
              <span className="text-[11px] text-[#b5afa8] font-medium">4 Soru</span>
            </div>
            <p className="font-serif text-[22px] font-light text-[#1a1a1a] leading-snug mb-2">
              Koku Profilini<br/>Keşfet
            </p>
            <p className="text-[13px] text-[#6b6560] leading-relaxed mb-5">
              4 kısa soruyla koku karakterini bulalım. Odunsu & Maskülen mi, Çiçeksi & Modern mi?
            </p>
            <div className="flex gap-2 flex-wrap mb-5">
              {['Fresh', 'Odunsu', 'Çiçeksi', 'Oriental', 'Gourmand'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-[11px] border" style={{ borderColor: 'rgba(198,134,42,0.2)', color: '#C6862A', background: 'rgba(198,134,42,0.05)' }}>{t}</span>
              ))}
            </div>
            <button className="btn-luxury btn-gold" onClick={e => { e.stopPropagation(); go('koku_testi') }}>
              Teste Başla →
            </button>
          </div>

          {/* ── Muadil ── */}
          <div className="bento-side glass-card p-6 cursor-pointer" onClick={() => go('muadil')}
            style={{ background: 'rgba(248,250,255,0.85)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
              style={{ background: 'rgba(99,102,241,0.08)' }}>
              🔍
            </div>
            <p className="font-serif text-[20px] font-light text-[#1a1a1a] mb-2">Muadil Sorgula</p>
            <p className="text-[13px] text-[#6b6560] leading-relaxed mb-4">
              Sauvage mı, Black Opium mu? Lüks parfümünün kataloğumuzdaki en yakın karşılığını bul.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-[#b5afa8]"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
                {I.search} Parfüm adı yaz...
              </div>
            </div>
          </div>

          {/* ── Nota Arama ── */}
          <div className="bento-third glass-card p-5" style={{ background: 'rgba(255,250,240,0.88)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: 'rgba(198,134,42,0.08)' }}>
              🧪
            </div>
            <p className="font-serif text-[17px] font-light text-[#1a1a1a] mb-1">Nota Arama</p>
            <p className="text-[12px] text-[#6b6560] mb-3">"Vanilya ve Amber içeren parfümler"</p>
            <input
              value={notaSearch}
              onChange={e => setNotaSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && notaSearch.trim()) { go('soru') } }}
              placeholder="Nota veya koku tarifi..."
              className="chat-input text-[13px]"
              style={{ padding: '9px 14px' }}
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* ── Hediye Sihirbazı ── */}
          <div className="bento-third glass-card p-5 cursor-pointer" onClick={() => go('hediye')}
            style={{ background: 'linear-gradient(135deg, rgba(255,245,250,0.90), rgba(255,240,248,0.85))' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: 'rgba(236,72,153,0.06)' }}>
              🎁
            </div>
            <p className="font-serif text-[17px] font-light text-[#1a1a1a] mb-1">Hediye Sihirbazı</p>
            <p className="text-[12px] text-[#6b6560] mb-3">Kime, hangi ortam için? Nokta atışı öneri.</p>
            <button className="btn-luxury btn-ghost text-[12px] px-3 py-2">Başla →</button>
          </div>

          {/* ── Koku Gardırobu ── */}
          <div className="bento-third glass-card p-5" style={{ background: 'rgba(248,255,252,0.85)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: 'rgba(34,197,94,0.07)' }}>
              👜
            </div>
            <p className="font-serif text-[17px] font-light text-[#1a1a1a] mb-1">Koku Gardırobum</p>
            {gardrop.length > 0 ? (
              <div className="space-y-1.5">
                {gardrop.slice(0,3).map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-[#6b6560]">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C6862A' }} />
                    <span className="truncate">{g}</span>
                  </div>
                ))}
                {gardrop.length > 3 && <p className="text-[11px] text-[#b5afa8]">+{gardrop.length-3} daha</p>}
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
  const [phase, setPhase] = useState<'home' | 'lead' | 'chat'>('home')
  const [activeNav, setActiveNav] = useState('asistan')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function handleLead(name: string, email: string) {
    const res = await fetch('/api/save-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
    const data = await res.json()
    const newLead = { name, email, lead_id: data.lead_id, session_id: data.session_id }
    setLead(newLead)
    if (pendingMode) { startMode(pendingMode, true); setPendingMode(null) }
    else setPhase('home')
  }

  function startMode(mode: string, skipCheck = false) {
    if (!lead && !skipCheck) { setPendingMode(mode); setPhase('lead'); return }
    setPhase('chat')
    setSidebarOpen(false)
    setActiveNav(mode === 'hediye' ? 'hediye' : mode === 'muadil' ? 'muadil' : 'asistan')
    const intros: Record<string, { text: string; options?: string[] }> = {
      koku_testi: { text: 'Harika! Sana en uygun kokuyu birlikte bulalım.\n\nBu parfümü ağırlıklı olarak ne zaman kullanacaksın?', options: ['Günlük & Ofis', 'Akşam & Gece', 'Özel Günler', 'Her Durumda'] },
      muadil: { text: 'Hangi parfümün muadilini arıyorsun? Marka ve ismi yaz, katalogumuzdan en yakın alternatifi bulayım.' },
      soru: { text: 'Parfümler hakkında ne merak ediyorsun? EDP/EDT farkı, kalıcılık, mevsim seçimi — her şeyi sorabilirsin.' },
      hediye: { text: 'Ne güzel bir düşünce! 🎁\n\nKime hediye alıyorsunuz?', options: ['Kadın için', 'Erkek için', 'Çift hediyesi', 'Fark etmez'] },
    }
    const intro = intros[mode] || { text: 'Nasıl yardımcı olabilirim?' }
    setMessages([{ role: 'assistant', content: intro.text, options: intro.options }])
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
      if ((data.type === 'recommendation' || data.type === 'elegancia' || data.type === 'home') && data.product) {
        newMsg.product = data.product
        if (data.type === 'recommendation' && lead) {
          fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: lead.name, email: lead.email, lead_id: lead.lead_id, session_id: lead.session_id, gold_name: data.product.name, gold_url: data.product.web_url, gold_woo_id: data.product.woo_id, gold_image: data.product.image_url, gold_code: data.product.code, scent_profile: data.scent_profile || {}, scent_story: data.output }),
          }).then(r => r.json()).then(d => { if (d.coupon_code) setCoupon(d.coupon_code) })
        }
      }
      setMessages(prev => [...prev, newMsg])
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Bir sorun oluştu, tekrar deneyin.' }]) }
    finally { setLoading(false); inputRef.current?.focus() }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }
  function newChat() { setMessages([]); setPhase('home'); setInput(''); setCoupon(null); setActiveNav('asistan'); setSidebarOpen(false) }

  const navItems = [
    { id: 'asistan', label: 'Asistan', icon: I.chat, action: () => { setActiveNav('asistan'); newChat() } },
    { id: 'hediye', label: 'Hediye Sihirbazı', icon: I.gift, action: () => { setActiveNav('hediye'); startMode('hediye') } },
    { id: 'muadil', label: 'Muadil Bul', icon: I.search, action: () => { setActiveNav('muadil'); startMode('muadil') } },
    { id: 'nota', label: 'Nota Arama', icon: I.note, action: () => { setActiveNav('nota'); startMode('soru') } },
    { id: 'favoriler', label: 'Koku Gardırobu', icon: I.heart, action: () => { setActiveNav('favoriler'); setPhase('home') } },
    { id: 'katalog', label: 'Ürünlerimiz', icon: I.spray, action: () => window.open('https://www.elegancevipperfume.com', '_blank') },
  ]

  /* ── RENDER ── */
  return (
    <div className="fixed inset-0 flex flex-col luxury-bg">

      {/* ══ TOP NAV ══ */}
      <nav className="flex-shrink-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <button className="lg:hidden p-1.5 rounded-xl text-[#6b6560] transition hover:bg-white/60" onClick={() => setSidebarOpen(!sidebarOpen)}>{I.menu}</button>

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
          {[{ l: 'Keşfet', m: 'home' }, { l: 'Muadil Bul', m: 'muadil' }, { l: 'Hediye Seç', m: 'hediye' }, { l: 'Koku Testi', m: 'koku_testi' }].map(item => (
            <button key={item.l} onClick={() => item.m === 'home' ? newChat() : startMode(item.m)}
              className="px-4 py-2 rounded-xl text-[13px] text-[#6b6560] font-medium transition-all hover:bg-white/60 hover:text-[#C6862A]">{item.l}</button>
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

      {/* ══ BODY ══ */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-56 flex-shrink-0
          transition-transform duration-250 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.5)' }}>

          {/* Profile */}
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="asya-avatar-glow">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <AsyaPortrait size={64} />
                </div>
              </div>
              <div>
                <p className="font-serif text-[16px] font-medium text-[#1a1a1a]">ASYA</p>
                <p className="text-[11px] text-[#b5afa8] mt-0.5">Koku Mimarı</p>
                <p className="text-[10px] text-[#b5afa8]">Elegance VIP Perfume</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={item.action} className="nav-item w-full"
                style={activeNav === item.id ? { color: '#C6862A', background: 'rgba(198,134,42,0.08)' } : {}}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom */}
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

        {/* ── MAIN ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* HOME */}
          {phase === 'home' && (
            <HomeScreen lead={lead} onStartMode={startMode} onShowLead={() => setPhase('lead')} />
          )}

          {/* LEAD FORM */}
          {phase === 'lead' && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                  <div className="asya-avatar-glow inline-block mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                      <AsyaPortrait size={80} />
                    </div>
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
                            <AyaAvatar size={32} />
                            <div className="glass-card px-4 py-3.5 max-w-sm xl:max-w-md" style={{ borderRadius: '20px 20px 20px 6px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                              <p className="text-[#1a1a1a] text-[14px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                          {msg.options && <OptionButtons options={msg.options} onSelect={opt => send(opt)} />}
                          {msg.product && (
                            <div className="pl-[44px]">
                              <ProductCard product={msg.product}
                                type={msg.type === 'elegancia' ? 'elegancia' : msg.type === 'home' ? 'home' : 'gold'}
                                coupon={msg.type === 'recommendation' ? coupon || undefined : undefined} />
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
                      <AyaAvatar size={32} />
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
                  <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Bir koku veya ruh hali tarif edin..."
                    disabled={loading} rows={1} className="chat-input flex-1"
                    style={{ minHeight: 44, maxHeight: 120 }} />
                  <button onClick={() => send(input)} disabled={loading || !input.trim()} className="send-btn">{I.send}</button>
                </div>
                <p className="text-center text-[11px] text-[#b5afa8] mt-2 hidden lg:block">
                  Elegance VIP Perfume · ASYA AI ·{' '}
                  <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition" style={{ color: '#C6862A' }}>elegancevipperfume.com</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
