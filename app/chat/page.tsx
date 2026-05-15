'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'assistant' | 'user'
  content: string
  product?: ProductData
  type?: string
  options?: string[]
}
interface ProductData {
  name: string; image_url: string; web_url: string; woo_id?: number
  top_notes?: string[]; heart_notes?: string[]; base_notes?: string[]
  code?: string
}
interface Lead { name: string; email: string; lead_id: string; session_id: string }

/* ── ASYA PORTRAIT SVG ── */
function AsyaPortrait({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="60" fill="#fdf0e0"/>
      {/* shoulders */}
      <ellipse cx="60" cy="108" rx="38" ry="20" fill="#e8c4a0" opacity="0.6"/>
      {/* neck */}
      <rect x="53" y="76" width="14" height="18" rx="7" fill="#e8c4a0"/>
      {/* hair back */}
      <ellipse cx="60" cy="46" rx="27" ry="30" fill="#2a1a0c"/>
      {/* face */}
      <ellipse cx="60" cy="50" rx="20" ry="23" fill="#f0c09a"/>
      {/* hair top / front */}
      <path d="M33 44 C36 18 50 13 60 13 C70 13 84 18 87 44 C79 30 68 26 60 26 C52 26 41 30 33 44Z" fill="#2a1a0c"/>
      {/* hair left */}
      <path d="M33 44 C29 56 31 72 36 84 C37 76 39 68 40 60 C38 52 34 48 33 44Z" fill="#2a1a0c"/>
      {/* hair right */}
      <path d="M87 44 C91 56 89 72 84 84 C83 76 81 68 80 60 C82 52 86 48 87 44Z" fill="#2a1a0c"/>
      {/* eyebrows */}
      <path d="M44 44 Q50 41 55 43" stroke="#2a1a0c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M65 43 Q70 41 76 44" stroke="#2a1a0c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* eyes white */}
      <ellipse cx="50" cy="50" rx="5" ry="3.5" fill="white"/>
      <ellipse cx="70" cy="50" rx="5" ry="3.5" fill="white"/>
      {/* pupils */}
      <circle cx="51" cy="50" r="2.5" fill="#2a1a0c"/>
      <circle cx="71" cy="50" r="2.5" fill="#2a1a0c"/>
      <circle cx="52" cy="49" r="0.9" fill="white"/>
      <circle cx="72" cy="49" r="0.9" fill="white"/>
      {/* nose */}
      <path d="M58 57 Q60 62 62 57" stroke="#c4845a" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* lips */}
      <path d="M52 67 Q56 64 60 65 Q64 64 68 67 Q64 72 60 71 Q56 72 52 67Z" fill="#c0604a"/>
      <path d="M52 67 Q60 65 68 67" stroke="#a04030" strokeWidth="0.8" fill="none"/>
      {/* earring left */}
      <circle cx="40" cy="57" r="2.5" fill="#C6862A"/>
      <rect x="39.2" y="59" width="1.6" height="6" rx="0.8" fill="#C6862A"/>
      <circle cx="40" cy="66" r="2" fill="#C6862A"/>
      {/* earring right */}
      <circle cx="80" cy="57" r="2.5" fill="#C6862A"/>
      <rect x="79.2" y="59" width="1.6" height="6" rx="0.8" fill="#C6862A"/>
      <circle cx="80" cy="66" r="2" fill="#C6862A"/>
      {/* subtle blush */}
      <ellipse cx="44" cy="58" rx="6" ry="3" fill="#e89070" opacity="0.2"/>
      <ellipse cx="76" cy="58" rx="6" ry="3" fill="#e89070" opacity="0.2"/>
    </svg>
  )
}

/* ── SMALL AVATAR ── */
function AyaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0 border border-[#ede8e0]"
      style={{ width: size, height: size }}>
      <AsyaPortrait size={size} />
    </div>
  )
}

/* ── ICONS ── */
const icons = {
  chat: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  gift: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  book: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  star: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  menu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>,
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  spray: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3h4v14H3z"/><path d="M7 6h6v11H7"/><path d="M13 8h3l2 9h-5"/><path d="M16 8V6l2-2"/><path d="M18 4h2"/><path d="M19 3v2"/></svg>,
}

/* ── LEAD FORM ── */
function LeadForm({ onSubmit }: { onSubmit: (n: string, e: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = (ev: React.FormEvent) => { ev.preventDefault(); if (!name || !email) return; setLoading(true); onSubmit(name, email) }
  return (
    <div className="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden max-w-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-5 py-4 border-b border-[#f4f0ea]">
        <p className="font-semibold text-[#1a1a1a] text-[14px]">Küçük bir rica ✨</p>
        <p className="text-[#6b6560] text-[13px] mt-1 leading-relaxed">Adınız ve e-postanızla size özel koku profilinizi maille göndereyim.</p>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" className="chat-input" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz" className="chat-input" required />
        <button type="submit" disabled={loading || !name || !email}
          className="w-full py-3 rounded-[14px] text-[13px] font-semibold text-white transition-all disabled:opacity-40 active:scale-[0.98]"
          style={{ background: '#C6862A' }}>
          {loading ? '...' : 'Devam Et'}
        </button>
      </form>
      <p className="text-center text-[11px] text-[#b5afa8] pb-4">🔒 Bilgileriniz güvende · Spam göndermiyoruz</p>
    </div>
  )
}

/* ── PRODUCT CARD ── */
function ProductCard({ product, type = 'gold', coupon }: { product: ProductData; type?: string; coupon?: string }) {
  const labels: Record<string, string> = { gold: 'Sizin İçin Seçildi', elegancia: 'Elegancia Premium', home: 'Oda Kokusu Önerisi', gift: 'Hediye Önerisi' }
  return (
    <div className="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden max-w-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-4 py-2 border-b border-[#f4f0ea]">
        <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: '#C6862A' }}>{labels[type] || labels.gold}</span>
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-20 h-24 object-cover rounded-xl border border-[#ede8e0]" />
            : <div className="w-20 h-24 rounded-xl bg-[#f4f0ea] flex items-center justify-center text-2xl">{type === 'home' ? '🕯️' : '🌸'}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1a1a1a] text-[13px] leading-snug">{product.name}</p>
          <div className="mt-2 space-y-1">
            {product.top_notes?.length ? <p className="text-[11px] text-[#6b6560]"><span className="text-[#b5afa8]">Üst · </span>{product.top_notes.slice(0, 3).join(', ')}</p> : null}
            {product.heart_notes?.length ? <p className="text-[11px] text-[#6b6560]"><span className="text-[#b5afa8]">Kalp · </span>{product.heart_notes.slice(0, 3).join(', ')}</p> : null}
            {product.base_notes?.length ? <p className="text-[11px] text-[#6b6560]"><span className="text-[#b5afa8]">Alt · </span>{product.base_notes.slice(0, 3).join(', ')}</p> : null}
          </div>
          {coupon && (
            <div className="mt-3 px-3 py-2 rounded-xl border border-[#ede8e0] bg-[#fdf8f0]">
              <p className="text-[10px] font-bold tracking-wider" style={{ color: '#C6862A' }}>%10 İNDİRİM KODUNUZ</p>
              <p className="font-mono font-bold tracking-widest text-sm text-[#1a1a1a] mt-0.5">{coupon}</p>
            </div>
          )}
          <a href={product.web_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition active:scale-95"
            style={{ background: '#C6862A' }}>
            Ürüne Git →
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── OPTION BUTTONS (inline chat choices) ── */
function OptionButtons({ options, onSelect }: { options: string[]; onSelect: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2 pl-[42px]">
      {options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)}
          className="px-4 py-2 rounded-full text-[13px] font-medium border border-[#ede8e0] bg-white text-[#6b6560] hover:border-[#C6862A] hover:text-[#C6862A] transition-colors"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════ */
export default function ChatPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [phase, setPhase] = useState<'home' | 'lead' | 'mode' | 'chat'>('home')
  const [activeNav, setActiveNav] = useState('asistan')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function handleLead(name: string, email: string) {
    const res = await fetch('/api/save-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
    const data = await res.json()
    setLead({ name, email, lead_id: data.lead_id, session_id: data.session_id })
    setPhase('mode')
  }

  function requireLead(then: () => void) {
    if (lead) { then(); return }
    setPhase('lead')
    sessionStorage.setItem('pendingMode', JSON.stringify(then.toString()))
  }

  function startMode(mode: string, skipLeadCheck = false) {
    if (!lead && !skipLeadCheck) { setPhase('lead'); sessionStorage.setItem('pendingMode', mode); return }
    setPhase('chat')
    setSidebarOpen(false)
    const intros: Record<string, { text: string; options?: string[] }> = {
      koku_testi: { text: 'Harika! Sana en uygun kokuyu birlikte bulalım.\n\nBu parfümü ağırlıklı olarak ne zaman kullanacaksın?', options: ['Günlük & Ofis', 'Akşam & Gece', 'Özel Günler', 'Her Durumda'] },
      muadil: { text: 'Tabii! Hangi parfümün muadilini arıyorsun? Marka ve parfüm adını yaz, katalogumuzdan en yakın alternatifi bulayım.' },
      soru: { text: 'Elbette! Parfümler hakkında ne merak ediyorsun? EDP/EDT farkı, kalıcılık, mevsim seçimi... Her şeyi sorabilirsin.' },
      hediye: { text: 'Ne güzel bir düşünce! 🎁 Kime hediye alıyorsunuz?', options: ['Kadın için', 'Erkek için', 'Çift hediyesi', 'Unisex / Cinsiyetsiz'] },
    }
    const intro = intros[mode] || { text: 'Nasıl yardımcı olabilirim?' }
    setMessages([{ role: 'assistant', content: intro.text, options: intro.options, type: 'intro' }])
  }

  function applyMode(mode: string) {
    setActiveNav(mode === 'hediye' ? 'hediye' : 'asistan')
    startMode(mode)
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      const newMsg: Message = { role: 'assistant', content: data.output || '...', type: data.type, options: data.options }
      if ((data.type === 'recommendation' || data.type === 'elegancia' || data.type === 'home') && data.product) {
        newMsg.product = data.product
        if (data.type === 'recommendation' && lead) {
          fetch('/api/send-email', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: lead.name, email: lead.email, lead_id: lead.lead_id, session_id: lead.session_id, gold_name: data.product.name, gold_url: data.product.web_url, gold_woo_id: data.product.woo_id, gold_image: data.product.image_url, gold_code: data.product.code, scent_profile: data.scent_profile || {}, scent_story: data.output }),
          }).then(r => r.json()).then(d => { if (d.coupon_code) setCoupon(d.coupon_code) })
        }
      }
      setMessages(prev => [...prev, newMsg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bir sorun oluştu, tekrar deneyin.' }])
    } finally { setLoading(false); inputRef.current?.focus() }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function newChat() { setMessages([]); setPhase('home'); setInput(''); setCoupon(null); setActiveNav('asistan'); setSidebarOpen(false) }

  const navItems = [
    { id: 'asistan', label: 'Asistan', icon: icons.chat, action: () => { setActiveNav('asistan'); setPhase('home'); setSidebarOpen(false) } },
    { id: 'hediye', label: 'Hediye Seçici', icon: icons.gift, action: () => { setActiveNav('hediye'); applyMode('hediye') } },
    { id: 'muadil', label: 'Muadil Bul', icon: icons.search, action: () => { setActiveNav('muadil'); applyMode('muadil') } },
    { id: 'katalog', label: 'Ürün Kataloğu', icon: icons.book, action: () => { window.open('https://www.elegancevipperfume.com/urunler', '_blank'); setSidebarOpen(false) } },
    { id: 'favoriler', label: 'Öne Çıkanlar', icon: icons.star, action: () => { setActiveNav('favoriler'); applyMode('koku_testi') } },
  ]

  const quickChips = [
    { label: '🌸 Günlük hafif koku', mode: 'koku_testi' },
    { label: '🌙 Akşam & gece parfümü', mode: 'koku_testi' },
    { label: '💼 İş & ofis için', mode: 'koku_testi' },
    { label: '🎁 Hediye almak istiyorum', mode: 'hediye' },
    { label: '🔍 Muadil sorgula', mode: 'muadil' },
    { label: '❓ EDP / EDT farkı nedir?', mode: 'soru' },
  ]

  /* ─── RENDER ─── */
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#f9f7f4' }}>

      {/* ══ TOP NAV ══ */}
      <nav className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-white border-b border-[#ede8e0] flex-shrink-0 z-30">
        <button className="lg:hidden p-1.5 rounded-lg text-[#6b6560] hover:bg-[#f4f0ea] transition" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {icons.menu}
        </button>
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ede8e0] flex-shrink-0">
            <AsyaPortrait size={32} />
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-semibold text-[#1a1a1a] leading-none">ASYA</p>
            <p className="text-[10px] text-[#b5afa8] tracking-wide mt-0.5">Koku Asistanı</p>
          </div>
        </div>
        {/* Center nav — desktop */}
        <div className="hidden lg:flex items-center gap-0.5 mx-auto">
          {[
            { label: 'Keşfet', mode: 'home' },
            { label: 'Muadil Bul', mode: 'muadil' },
            { label: 'Hediye Seç', mode: 'hediye' },
            { label: 'Koku Testi', mode: 'koku_testi' },
          ].map(item => (
            <button key={item.label} onClick={() => item.mode === 'home' ? newChat() : applyMode(item.mode)}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
              style={{ color: '#6b6560' }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#C6862A'; (e.target as HTMLButtonElement).style.background = 'rgba(198,134,42,0.08)' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#6b6560'; (e.target as HTMLButtonElement).style.background = 'transparent' }}>
              {item.label}
            </button>
          ))}
        </div>
        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border"
            style={{ background: 'rgba(198,134,42,0.06)', borderColor: 'rgba(198,134,42,0.15)', color: '#C6862A' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Çevrimiçi
          </div>
          <div className="w-8 h-8 rounded-full bg-[#f4f0ea] border border-[#ede8e0] flex items-center justify-center text-[#6b6560]">
            {icons.user}
          </div>
        </div>
      </nav>

      {/* ══ BODY ══ */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-56 bg-white border-r border-[#ede8e0] flex-shrink-0
          transition-transform duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* ASYA profile */}
          <div className="p-5 border-b border-[#f4f0ea]">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C6862A]/20">
                <AsyaPortrait size={64} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">ASYA</p>
                <p className="text-[11px] text-[#b5afa8] mt-0.5">Koku Mimarı</p>
                <p className="text-[10px] text-[#b5afa8]">Elegance VIP Perfume</p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={item.action}
                className="nav-item w-full"
                style={activeNav === item.id ? { color: '#C6862A', background: 'rgba(198,134,42,0.08)' } : {}}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {/* Divider */}
            <div className="h-px bg-[#f4f0ea] my-2" />

            {/* Quick links */}
            <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer"
              className="nav-item w-full block text-left">
              {icons.spray}
              <span>Sitemizi Ziyaret Et</span>
            </a>
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-[#f4f0ea] space-y-2">
            <button onClick={newChat}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white transition active:scale-[0.98]"
              style={{ background: '#C6862A' }}>
              {icons.plus}
              Yeni Konuşma
            </button>
            {lead && (
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <div className="w-7 h-7 rounded-full bg-[#f4f0ea] flex items-center justify-center text-[11px] font-semibold text-[#6b6560] flex-shrink-0">
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

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* ─── HOME SCREEN ─── */}
          {(phase === 'home' || phase === 'lead' || phase === 'mode') && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 py-10 lg:py-14">

                {/* Hero */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: 'rgba(198,134,42,0.25)' }}>
                    <AsyaPortrait size={56} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium tracking-widest uppercase mb-1" style={{ color: '#C6862A' }}>Elegance VIP Perfume</p>
                    <h1 className="text-[22px] font-semibold text-[#1a1a1a] leading-snug">
                      Hoş geldiniz! Ben ASYA. 👋
                    </h1>
                    <p className="text-[#6b6560] text-[14px] mt-1 leading-relaxed">
                      Bugün size nasıl bir koku eşliği yapabilirim?
                    </p>
                  </div>
                </div>

                {/* Quick chips */}
                {phase === 'home' && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {quickChips.map(chip => (
                      <button key={chip.label} onClick={() => applyMode(chip.mode)}
                        className="px-4 py-2 rounded-full text-[13px] font-medium border border-[#ede8e0] bg-white text-[#6b6560] hover:border-[#C6862A] hover:text-[#C6862A] transition-colors"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Lead form */}
                {phase === 'lead' && <div className="mb-8"><LeadForm onSubmit={handleLead} /></div>}

                {/* Mode selector */}
                {phase === 'mode' && lead && (
                  <div className="mb-8">
                    <p className="text-[14px] font-medium text-[#1a1a1a] mb-4">Harika {lead.name}! Ne yapmak istersin?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'koku_testi', title: 'Koku Testi', desc: '4 soruyla imza kokunu seç', icon: '✨' },
                        { id: 'muadil', title: 'Muadil Sorgula', desc: 'Bildiğin parfümün muadilini bul', icon: '🔍' },
                        { id: 'hediye', title: 'Hediye Seçici', desc: 'Sevdiklerine mükemmel koku', icon: '🎁' },
                        { id: 'soru', title: 'Soru Sor', desc: 'EDP/EDT, kalıcılık, mevsim', icon: '💬' },
                      ].map(m => (
                        <button key={m.id} onClick={() => applyMode(m.id)}
                          className="option-card flex-col items-start gap-2 p-4 text-left">
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <p className="font-semibold text-[#1a1a1a] text-[13px]">{m.title}</p>
                            <p className="text-[#6b6560] text-[12px] mt-0.5">{m.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature cards — home only */}
                {phase === 'home' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'koku_testi', icon: '✨', title: 'Koku Profilinizi Keşfedin', desc: '4 kısa soruyla size özel parfüm profilinizi ve ideal koku önerinizi alın.', color: 'rgba(198,134,42,0.10)' },
                      { id: 'hediye', icon: '🎁', title: 'Hediye Seçici', desc: 'Sevdikleriniz için bütçenize ve zevkine uygun mükemmel parfüm hediyesi bulun.', color: 'rgba(34,197,94,0.08)' },
                      { id: 'muadil', icon: '🔍', title: 'Muadil Bul', desc: 'Sevdiğiniz lüks parfümün kataloğumuzdaki en yakın muadilini keşfedin.', color: 'rgba(99,102,241,0.08)' },
                    ].map(card => (
                      <button key={card.id} onClick={() => applyMode(card.id)}
                        className="option-card flex-col items-start gap-3 text-left p-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: card.color }}>
                          {card.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a1a1a] text-[14px]">{card.title}</p>
                          <p className="text-[#6b6560] text-[12px] mt-1.5 leading-relaxed">{card.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {/* ─── CHAT SCREEN ─── */}
          {phase === 'chat' && (
            <>
              <div className="flex-1 chat-scroll py-6 px-4" style={{ background: '#f9f7f4' }}>
                <div className="max-w-2xl mx-auto space-y-5">
                  {messages.map((msg, i) => (
                    <div key={i} className="msg-in">
                      {msg.role === 'assistant' ? (
                        <div className="space-y-2">
                          <div className="flex gap-3 items-end">
                            <AyaAvatar size={32} />
                            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 border border-[#ede8e0] max-w-sm xl:max-w-md"
                              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                          <div className="px-4 py-3.5 rounded-2xl rounded-br-sm max-w-sm xl:max-w-md" style={{ background: '#C6862A' }}>
                            <p className="text-white text-[14px] leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 items-end msg-in">
                      <AyaAvatar size={32} />
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-[#ede8e0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div className="flex gap-1 items-center h-4">
                          <span className="dot" /><span className="dot" /><span className="dot" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} className="h-1" />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-[#ede8e0] bg-white px-4 py-3 flex-shrink-0">
                <div className="flex gap-2 items-end max-w-2xl mx-auto">
                  <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Bir koku veya ruh hali tarif edin..."
                    disabled={loading} rows={1} className="chat-input flex-1"
                    style={{ minHeight: 44, maxHeight: 120 }} />
                  <button onClick={() => send(input)} disabled={loading || !input.trim()} className="send-btn">
                    {icons.send}
                  </button>
                </div>
                <p className="text-center text-[11px] text-[#b5afa8] mt-2 hidden lg:block">
                  Elegance VIP Perfume · ASYA AI ·{' '}
                  <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer"
                    className="transition hover:opacity-70" style={{ color: '#C6862A' }}>elegancevipperfume.com</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
