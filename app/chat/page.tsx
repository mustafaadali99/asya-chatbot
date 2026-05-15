'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'assistant' | 'user'
  content: string
  product?: ProductData
  type?: string
}
interface ProductData {
  name: string; image_url: string; web_url: string; woo_id?: number
  top_notes?: string[]; heart_notes?: string[]; base_notes?: string[]
  code?: string
}
interface Lead { name: string; email: string; lead_id: string; session_id: string }

/* ── ICONS ── */
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

/* ── AVATAR ── */
function AyaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: '#C6862A' }}>
      A
    </div>
  )
}

/* ── LEAD FORM ── */
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
    <div className="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden max-w-sm"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-5 py-4 border-b border-[#f4f0ea]">
        <p className="font-semibold text-[#1a1a1a] text-[14px]">Küçük bir rica</p>
        <p className="text-[#6b6560] text-[13px] mt-1 leading-relaxed">
          Adınız ve e-postanızla size özel öneriyi maille göndereyim.
        </p>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız"
          className="chat-input" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz"
          className="chat-input" required />
        <button type="submit" disabled={loading || !name || !email}
          className="w-full py-3 rounded-[14px] text-[13px] font-semibold text-white transition-all disabled:opacity-40 active:scale-[0.98]"
          style={{ background: '#C6862A' }}>
          {loading ? '...' : 'Devam Et'}
        </button>
      </form>
      <p className="text-center text-[11px] text-[#b5afa8] pb-4">Bilgileriniz güvende · Spam göndermiyoruz</p>
    </div>
  )
}

/* ── PRODUCT CARD ── */
function ProductCard({ product, type = 'gold', coupon }: { product: ProductData; type?: string; coupon?: string }) {
  const label = type === 'home' ? 'Oda Kokusu Önerisi' : type === 'elegancia' ? 'Elegancia Premium' : 'Sizin İçin Seçildi'
  return (
    <div className="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden max-w-sm"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-4 py-2 border-b border-[#f4f0ea]">
        <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: '#C6862A' }}>{label}</span>
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
            Ürüne Git
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── TYPING ── */
function Typing() {
  return (
    <div className="flex gap-3 items-end msg-in">
      <AyaAvatar size={30} />
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-[#ede8e0]"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex gap-1 items-center h-4">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════ */
export default function ChatPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [phase, setPhase] = useState<'home' | 'lead' | 'mode' | 'chat'>('home')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleLead(name: string, email: string) {
    const res = await fetch('/api/save-lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await res.json()
    setLead({ name, email, lead_id: data.lead_id, session_id: data.session_id })
    setPhase('mode')
  }

  function startMode(mode: string) {
    if (!lead) { setPhase('lead'); return }
    applyMode(mode)
  }

  function applyMode(mode: string) {
    setPhase('chat')
    const intros: Record<string, string> = {
      koku_testi: 'Mükemmel! Sana en uygun kokuyu birlikte bulalım.\n\nBu parfümü günlük mü kullanacaksın, yoksa gece ve özel günler için mi arıyorsun?',
      muadil: 'Tabii! Hangi parfümün muadilini arıyorsun? Marka ve parfüm adını yaz, katalogumuzdan en yakın alternatifi bulayım.',
      soru: 'Elbette! Parfümler hakkında ne merak ediyorsun?',
    }
    setMessages([{ role: 'assistant', content: intros[mode] || 'Nasıl yardımcı olabilirim?' }])
  }

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      const newMsg: Message = { role: 'assistant', content: data.output || '...', type: data.type }
      if ((data.type === 'recommendation' || data.type === 'elegancia' || data.type === 'home') && data.product) {
        newMsg.product = data.product
        if (data.type === 'recommendation' && lead) {
          fetch('/api/send-email', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: lead.name, email: lead.email,
              lead_id: lead.lead_id, session_id: lead.session_id,
              gold_name: data.product.name, gold_url: data.product.web_url,
              gold_woo_id: data.product.woo_id, gold_image: data.product.image_url,
              gold_code: data.product.code, scent_profile: data.scent_profile || {},
              scent_story: data.output,
            }),
          }).then(r => r.json()).then(d => { if (d.coupon_code) setCoupon(d.coupon_code) })
        }
      }
      setMessages(prev => [...prev, newMsg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bir sorun oluştu, tekrar deneyin.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const navItems = [
    { id: 'asistan', label: 'Asistan', icon: <IconChat /> },
    { id: 'arsiv', label: 'Koku Arşivi', icon: <IconBook /> },
    { id: 'muadil', label: 'Muadil Bul', icon: <IconSearch /> },
  ]

  const quickChips = [
    { label: 'Günlük koku önerisi', mode: 'koku_testi' },
    { label: 'Muadil sorgula', mode: 'muadil' },
    { label: 'EDP mi EDT mi?', mode: 'soru' },
    { label: 'Özel gece kokusu', mode: 'koku_testi' },
  ]

  /* ─── RENDER ─── */
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#f9f7f4' }}>

      {/* ══ TOP NAV ══ */}
      <nav className="flex items-center gap-4 px-5 py-3 bg-white border-b border-[#ede8e0] flex-shrink-0 z-30">
        {/* Mobile menu button */}
        <button className="lg:hidden p-1.5 rounded-lg text-[#6b6560] hover:bg-[#f4f0ea] transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: '#C6862A' }}>A</div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-semibold text-[#1a1a1a] leading-none">ASYA</p>
            <p className="text-[10px] text-[#b5afa8] tracking-wide mt-0.5">Koku Asistanı</p>
          </div>
        </div>

        {/* Center nav links — desktop */}
        <div className="hidden lg:flex items-center gap-1 mx-auto">
          {[
            { label: 'Keşfet', active: true },
            { label: 'Koku Arşivi' },
            { label: 'Muadil Bul' },
          ].map(item => (
            <button key={item.label}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
              style={{
                color: item.active ? '#C6862A' : '#6b6560',
                background: item.active ? 'rgba(198,134,42,0.08)' : 'transparent',
              }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right — user avatar */}
        <div className="ml-auto w-8 h-8 rounded-full bg-[#f4f0ea] border border-[#ede8e0] flex items-center justify-center text-[#6b6560]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </nav>

      {/* ══ BODY ══ */}
      <div className="flex flex-1 min-h-0">

        {/* ── SIDEBAR ── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <aside className={`
            fixed lg:static inset-y-0 left-0 z-30 flex flex-col
            w-56 bg-white border-r border-[#ede8e0] flex-shrink-0
            transition-transform duration-200 lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `} style={{ top: '0', paddingTop: sidebarOpen ? '0' : undefined }}>

            {/* Profile section */}
            <div className="p-5 border-b border-[#f4f0ea]">
              <div className="flex items-center gap-3">
                <AyaAvatar size={38} />
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] leading-none">ASYA</p>
                  <p className="text-[11px] text-[#b5afa8] mt-0.5">Koku Mimarı</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-3 space-y-0.5">
              {navItems.map((item, i) => (
                <button key={item.id}
                  className="nav-item w-full"
                  style={{ color: i === 0 ? '#C6862A' : undefined, background: i === 0 ? 'rgba(198,134,42,0.08)' : undefined }}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-[#f4f0ea] space-y-2">
              <button
                onClick={() => { setMessages([]); setPhase('home'); setInput(''); setCoupon(null); setSidebarOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white transition active:scale-[0.98]"
                style={{ background: '#C6862A' }}>
                <IconPlus />
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
        </>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* HOME SCREEN */}
          {(phase === 'home' || phase === 'lead' || phase === 'mode') && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 py-10 lg:py-16">

                {/* Welcome */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <AyaAvatar size={44} />
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">ASYA</p>
                      <p className="text-[12px] text-[#b5afa8]">Elegance VIP Perfume · Koku Asistanı</p>
                    </div>
                  </div>
                  <h1 className="text-[22px] font-semibold text-[#1a1a1a] leading-snug mb-2">
                    Hoş geldiniz! 👋
                  </h1>
                  <p className="text-[#6b6560] text-[15px] leading-relaxed">
                    Bugün size nasıl bir koku eşliği yapabilirim?
                  </p>
                </div>

                {/* Quick chips */}
                {phase === 'home' && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {quickChips.map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => startMode(chip.mode)}
                        className="px-4 py-2 rounded-full text-[13px] font-medium border border-[#ede8e0] bg-white text-[#6b6560] hover:border-[#C6862A] hover:text-[#C6862A] transition-colors"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Lead form */}
                {phase === 'lead' && (
                  <div className="mb-8">
                    <LeadForm onSubmit={handleLead} />
                  </div>
                )}

                {/* Mode selector */}
                {phase === 'mode' && lead && (
                  <div className="mb-8">
                    <p className="text-[14px] font-medium text-[#1a1a1a] mb-3">Harika {lead.name}! Nasıl yardımcı olayım?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'muadil', title: 'Muadil Sorgula', desc: 'Bildiğin parfümün muadilini bul', icon: '🔍' },
                        { id: 'koku_testi', title: 'Koku Testi', desc: '4 soruyla imza kokunu seç', icon: '✨' },
                        { id: 'soru', title: 'Soru Sor', desc: 'EDP/EDT, kalıcılık, kullanım', icon: '💬' },
                      ].map(m => (
                        <button key={m.id} onClick={() => applyMode(m.id)}
                          className="option-card flex-col items-start text-left p-4 gap-2">
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

                {/* Feature cards */}
                {phase === 'home' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => startMode('koku_testi')}
                      className="option-card flex-col items-start gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(198,134,42,0.10)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6862A" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a1a1a] text-[14px]">Koku Profilinizi Analiz Edin</p>
                        <p className="text-[#6b6560] text-[12px] mt-1 leading-relaxed">
                          Ruh halinizi keşfederek temel bir koku profili oluşturun, size özel öneriler alın.
                        </p>
                      </div>
                    </button>
                    <button onClick={() => startMode('muadil')}
                      className="option-card flex-col items-start gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(198,134,42,0.10)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6862A" strokeWidth="2" strokeLinecap="round">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a1a1a] text-[14px]">Elegance Parfüm Muadili</p>
                        <p className="text-[#6b6560] text-[12px] mt-1 leading-relaxed">
                          Bildiğiniz lüks bir parfümün en yakın muadilini katalogumuzdan bulun.
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {/* CHAT SCREEN */}
          {phase === 'chat' && (
            <>
              <div className="flex-1 chat-scroll py-6 px-4 space-y-4">
                <div className="max-w-2xl mx-auto space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className="space-y-2 msg-in">
                      {msg.role === 'assistant' ? (
                        <div className="flex gap-3 items-end">
                          <AyaAvatar size={30} />
                          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 border border-[#ede8e0] max-w-sm xl:max-w-md"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <p className="text-[#1a1a1a] text-[14px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="px-4 py-3.5 rounded-2xl rounded-br-sm max-w-sm xl:max-w-md"
                            style={{ background: '#C6862A' }}>
                            <p className="text-white text-[14px] leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      )}
                      {msg.product && (
                        <div className={msg.role === 'assistant' ? 'pl-[42px]' : 'flex justify-end'}>
                          <ProductCard
                            product={msg.product}
                            type={msg.type === 'elegancia' ? 'elegancia' : msg.type === 'home' ? 'home' : 'gold'}
                            coupon={msg.type === 'recommendation' ? coupon || undefined : undefined}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 items-end msg-in">
                      <AyaAvatar size={30} />
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-[#ede8e0]">
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
                    <IconSend />
                  </button>
                </div>
                <p className="text-center text-[11px] text-[#b5afa8] mt-2 hidden lg:block">
                  Elegance VIP Perfume · ASYA AI ·{' '}
                  <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer"
                    className="transition hover:opacity-70" style={{ color: '#C6862A' }}>
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
