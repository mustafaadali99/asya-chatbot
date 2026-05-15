'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

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

/* ── AVATAR ── */
function AyaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-white shadow-lg"
      style={{ width: size, height: size, fontSize: size * 0.38, background: 'linear-gradient(135deg,#c9a227,#8b6914)' }}>
      A
    </div>
  )
}

/* ── LEAD FORM ── */
function LeadForm({ onSubmit }: { onSubmit: (n: string, e: string) => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false)
  const submit = (ev: React.FormEvent) => { ev.preventDefault(); if (!name || !email) return; setLoading(true); onSubmit(name, email) }
  return (
    <div className="msg-in mx-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-50">
        <p className="font-semibold text-stone-800 text-[15px]">Küçük bir rica 😊</p>
        <p className="text-stone-400 text-[13px] mt-1 leading-relaxed">Adınızı ve emailinizi alabilir miyim? Size özel koku profilinizi ve önerimi maille göndereceğim 💌</p>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız"
          className="input-focus w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 transition-all bg-stone-50 focus:bg-white" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz"
          className="input-focus w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 transition-all bg-stone-50 focus:bg-white" required />
        <button type="submit" disabled={loading || !name || !email}
          className="w-full py-3.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all disabled:opacity-40 active:scale-[0.98] text-white"
          style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg,#1c1917,#292524)' }}>
          {loading ? '...' : 'Devam Et ✨'}
        </button>
      </form>
      <p className="text-center text-[11px] text-stone-300 pb-4">🔒 Bilgileriniz güvende · Spam göndermiyoruz</p>
    </div>
  )
}

/* ── MODE SELECTOR ── */
function ModeSelector({ name, onSelect }: { name: string; onSelect: (m: string) => void }) {
  const modes = [
    { id: 'muadil', icon: '🔍', title: 'Muadil Sorgula', desc: 'Bildiğin bir parfümün muadilini bulalım' },
    { id: 'koku_testi', icon: '✨', title: 'Koku Testine Başla', desc: '4 soruyla imza kokunu seçelim' },
    { id: 'soru', icon: '💬', title: 'Soru Sor', desc: 'EDP/EDT, kalıcılık, kullanım hakkında' },
  ]
  return (
    <div className="msg-in mx-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <p className="font-semibold text-stone-800 text-[15px]">Harika {name} ✨</p>
        <p className="text-stone-400 text-[13px] mt-0.5">Nasıl yardımcı olayım?</p>
      </div>
      <div className="px-5 pb-5 grid grid-cols-1 gap-2.5">
        {modes.map((m, i) => (
          <button key={m.id} onClick={() => onSelect(m.id)}
            style={{ animationDelay: `${i * 80}ms` }}
            className="msg-in flex items-center gap-4 p-4 rounded-xl border border-stone-100 hover:border-amber-300 hover:bg-amber-50/50 active:scale-[0.98] transition-all text-left group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-stone-50 group-hover:bg-amber-100 transition-colors">
              {m.icon}
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">{m.title}</p>
              <p className="text-stone-400 text-[12px] mt-0.5">{m.desc}</p>
            </div>
            <div className="ml-auto text-stone-300 group-hover:text-amber-400 transition-colors">›</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── PRODUCT CARD ── */
function ProductCard({ product, type = 'gold', coupon }: { product: ProductData; type?: string; coupon?: string }) {
  const colors = {
    gold: { banner: 'bg-amber-50 text-amber-700 border-b border-amber-100', label: '⭐ Sizin İçin Seçildi' },
    elegancia: { banner: 'bg-stone-900 text-amber-400', label: '✦ Elegancia Premium' },
    home: { banner: 'bg-emerald-50 text-emerald-700 border-b border-emerald-100', label: '🪔 Oda Kokusu Önerisi' },
  }[type] || { banner: 'bg-amber-50 text-amber-700', label: '⭐' }

  return (
    <div className="msg-in mx-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className={`px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase ${colors.banner}`}>
        {colors.label}
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-24 h-28 object-cover rounded-xl border border-stone-100" />
            : <div className="w-24 h-28 rounded-xl bg-stone-100 flex items-center justify-center text-3xl">{type === 'home' ? '🪔' : '🌸'}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 text-[13px] leading-snug">{product.name}</p>
          <div className="mt-2 space-y-1">
            {product.top_notes?.length && <p className="text-[11px] text-stone-400"><span className="text-stone-300">Üst •</span> {product.top_notes.slice(0,3).join(', ')}</p>}
            {product.heart_notes?.length && <p className="text-[11px] text-stone-400"><span className="text-stone-300">Kalp •</span> {product.heart_notes.slice(0,3).join(', ')}</p>}
            {product.base_notes?.length && <p className="text-[11px] text-stone-400"><span className="text-stone-300">Alt •</span> {product.base_notes.slice(0,3).join(', ')}</p>}
          </div>
          {coupon && (
            <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)' }}>
              <p className="text-[10px] font-bold text-amber-800 tracking-wider">%10 İNDİRİM</p>
              <p className="text-amber-900 font-mono font-bold tracking-widest text-sm">{coupon}</p>
            </div>
          )}
          <a href={product.web_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold transition active:scale-95 text-white shadow-sm"
            style={{ background: type === 'elegancia' ? 'linear-gradient(135deg,#1c1917,#292524)' : 'linear-gradient(135deg,#1c1917,#292524)' }}>
            Ürüne Git ✨
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── TYPING INDICATOR ── */
function Typing() {
  return (
    <div className="flex gap-3 items-end px-4 msg-in">
      <AyaAvatar size={32} />
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-stone-100">
        <div className="typing flex gap-1.5 items-center h-4">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   ANA SAYFA
══════════════════════════════════════════════════ */
export default function ChatPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [phase, setPhase] = useState<'lead' | 'mode' | 'chat'>('lead')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading, phase])

  async function handleLead(name: string, email: string) {
    const res = await fetch('/api/save-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
    const data = await res.json()
    setLead({ name, email, lead_id: data.lead_id, session_id: data.session_id })
    setMessages([{ role: 'assistant', content: `Kaydedildi ✅`, type: 'saved' }])
    setPhase('mode')
  }

  async function handleMode(mode: string) {
    setPhase('chat')
    const intros: Record<string, string> = {
      koku_testi: `Mükemmel! 🌸 Sana en uygun kokuyu birlikte bulalım. Bu parfümü günlük mü kullanacaksın, yoksa gece ve özel günler için mi arıyorsun?`,
      muadil: `Tabii! 🔍 Hangi parfümün muadilini arıyorsun? Marka ve parfüm adını yaz, katalogumuzdan en yakın alternatifi bulayım.`,
      soru: `Elbette! 💬 Parfümler hakkında ne merak ediyorsun? Her şeyi sorabilirsin.`,
    }
    setMessages(prev => [...prev, { role: 'assistant', content: intros[mode] || 'Nasıl yardımcı olabilirim?' }])
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      const newMsg: Message = { role: 'assistant', content: data.output || '😊', type: data.type }

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
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Bir sorun oluştu, tekrar deneyin 😊' }]) }
    finally { setLoading(false); inputRef.current?.focus() }
  }

  /* ─── RENDER ─── */
  return (
    <div className="fixed inset-0 flex" style={{ background: '#f7f3ee' }}>

      {/* ══ SOL PANEL (sadece desktop) ══ */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#100c0e 0%,#1a1118 50%,#0d0a0c 100%)' }}>

        {/* Dekoratif orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-1 absolute w-80 h-80 -top-20 -left-20 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)' }} />
          <div className="orb-2 absolute w-64 h-64 bottom-0 -right-10 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(140,80,140,0.12) 0%, transparent 70%)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-lg"
              style={{ background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#0a0608' }}>A</div>
            <div>
              <p className="text-white font-semibold text-sm tracking-wide leading-none">ASYA</p>
              <p className="text-amber-400/60 text-[10px] tracking-[2px] uppercase mt-0.5">Koku Asistanı</p>
            </div>
          </Link>

          {/* Büyük parfüm illüstrasyonu */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-amber-500/10 animate-pulse" />
              </div>
              <svg width="140" height="200" viewBox="0 0 96 140" fill="none">
                <rect x="32" y="2" width="32" height="22" rx="6" fill="#c9a227" opacity="0.85"/>
                <rect x="36" y="6" width="24" height="14" rx="4" fill="#f0d060" opacity="0.5"/>
                <rect x="36" y="22" width="24" height="14" rx="3" fill="#a07e1a"/>
                <rect x="8" y="36" width="80" height="96" rx="16" fill="url(#g2)"/>
                <rect x="14" y="42" width="10" height="36" rx="5" fill="white" opacity="0.06"/>
                <rect x="18" y="72" width="60" height="46" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(201,162,39,0.25)" strokeWidth="1"/>
                <text x="48" y="90" textAnchor="middle" fill="#c9a227" fontSize="8" fontFamily="serif" letterSpacing="2">ELEGANCE</text>
                <text x="48" y="102" textAnchor="middle" fill="#c9a227" fontSize="5.5" fontFamily="serif" letterSpacing="1">VIP PERFUME</text>
                <text x="48" y="113" textAnchor="middle" fill="rgba(201,162,39,0.45)" fontSize="7" fontFamily="serif">ASYA</text>
                <defs>
                  <linearGradient id="g2" x1="8" y1="36" x2="88" y2="132" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2a1f2e"/>
                    <stop offset="50%" stopColor="#1a1220"/>
                    <stop offset="100%" stopColor="#0d0a12"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Alt kısım */}
          <div className="mb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-6" />
            <h2 className="shimmer-text text-3xl font-thin tracking-widest mb-2">ELEGANCE</h2>
            <p className="text-white/20 text-[11px] tracking-[3px] uppercase">VIP Perfume</p>
            <p className="text-white/40 text-xs mt-4 leading-relaxed font-light">
              Ruhunuza en uygun kokuyu bulmak için buradayım. Birlikte keşfedelim.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="relative w-2 h-2">
                <div className="online-dot absolute inset-0 rounded-full bg-emerald-400" />
              </div>
              <span className="text-white/30 text-[11px]">Çevrimiçi · Hemen yanıt veriyor</span>
            </div>
            <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer"
              className="block mt-4 text-[11px] text-amber-400/30 hover:text-amber-400/60 transition tracking-wider">
              www.elegancevipperfume.com ↗
            </a>
          </div>
        </div>
      </aside>

      {/* ══ SAĞ PANEL — CHAT ══ */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 glass border-b border-white/60 sticky top-0 z-20">
          <Link href="/" className="p-2 rounded-xl hover:bg-black/5 transition text-stone-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <AyaAvatar size={36} />
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm leading-none">ASYA</p>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#c9a227' }}>Elegance VIP · AI Koku Asistanı</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-2 h-2">
              <div className="online-dot absolute inset-0 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] text-stone-400">Çevrimiçi</span>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 glass border-b border-white/60">
          <div className="flex items-center gap-3">
            <AyaAvatar size={40} />
            <div>
              <p className="font-semibold text-stone-800 leading-none">ASYA — Koku Asistanı</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative w-1.5 h-1.5">
                  <div className="online-dot absolute inset-0 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] text-stone-400">Çevrimiçi · GPT-4o ile çalışıyor</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-stone-400">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100">AI Destekli</span>
            <span className="px-3 py-1 rounded-full bg-stone-100 text-[11px]">🔒 Güvenli</span>
          </div>
        </header>

        {/* Mesajlar */}
        <div className="flex-1 chat-scroll py-5 space-y-4">

          {/* Karşılama */}
          <div className="flex gap-3 items-end px-4 msg-in">
            <AyaAvatar size={32} />
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3.5 shadow-sm border border-stone-100 max-w-sm">
              <p className="text-stone-700 text-[14px] leading-relaxed">
                Hoş geldiniz 🌸<br/>
                Ben <span className="font-semibold text-stone-900">Elegance VIP Perfume</span> Koku Asistanı <span className="font-semibold" style={{color:'#c9a227'}}>ASYA</span>.<br/>
                Ruhunuza en uygun kokuyu birlikte bulmaya ne dersiniz?
              </p>
            </div>
          </div>

          {/* Lead form */}
          {phase === 'lead' && (
            <div className="px-4">
              <LeadForm onSubmit={handleLead} />
            </div>
          )}

          {/* Mesajlar */}
          {messages.map((msg, i) => {
            if (msg.type === 'saved') return (
              <div key={i} className="flex justify-center">
                <span className="text-[12px] text-stone-400 bg-stone-100 px-4 py-1.5 rounded-full">Kaydedildi ✅</span>
              </div>
            )
            return (
              <div key={i} className="space-y-2">
                {msg.role === 'assistant' ? (
                  <div className="flex gap-3 items-end px-4 msg-in">
                    <AyaAvatar size={32} />
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3.5 shadow-sm border border-stone-100 max-w-sm xl:max-w-md">
                      <p className="text-stone-700 text-[14px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end px-4 msg-in">
                    <div className="px-4 py-3.5 rounded-2xl rounded-br-md max-w-sm xl:max-w-md shadow-sm"
                      style={{ background: 'linear-gradient(135deg,#1c1917,#292524)' }}>
                      <p className="text-white text-[14px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                )}
                {msg.product && (
                  <div className="px-4">
                    <ProductCard product={msg.product} type={msg.type === 'elegancia' ? 'elegancia' : msg.type === 'home' ? 'home' : 'gold'} coupon={msg.type === 'recommendation' ? coupon || undefined : undefined} />
                  </div>
                )}
              </div>
            )
          })}

          {/* Mode selector */}
          {phase === 'mode' && lead && (
            <div className="px-4">
              <ModeSelector name={lead.name} onSelect={handleMode} />
            </div>
          )}

          {/* Typing */}
          {loading && <Typing />}

          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Input */}
        {phase === 'chat' && (
          <div className="glass border-t border-white/60 px-4 py-3">
            <div className="flex gap-2 items-center max-w-2xl mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                placeholder="Mesajınızı yazın..."
                disabled={loading}
                className="flex-1 bg-white border border-stone-200 rounded-2xl px-5 py-3.5 text-[14px] text-stone-700 placeholder-stone-300 shadow-sm transition-all input-focus disabled:opacity-60"
              />
              <button onClick={() => send(input)} disabled={loading || !input.trim()}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all disabled:opacity-30 active:scale-95 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a227,#8b6914)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[11px] text-stone-300 mt-2 hidden lg:block">
              Elegance VIP Perfume · ASYA AI · <a href="https://www.elegancevipperfume.com" target="_blank" className="hover:text-stone-400 transition">elegancevipperfume.com</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
