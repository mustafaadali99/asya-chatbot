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
    <div className="flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-white"
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
    <div className="msg-in mx-1 bg-white rounded-2xl border border-[#ede8e0] overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-5 py-4 border-b border-[#f4f0ea]">
        <p className="font-semibold text-[#1a1a1a] text-[14px]">Küçük bir rica</p>
        <p className="text-[#6b6560] text-[13px] mt-1 leading-relaxed">
          Adınız ve e-postanız ile size özel koku profilinizi maille göndereyim.
        </p>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Adınız Soyadınız"
          className="chat-input"
          required
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className="chat-input"
          required
        />
        <button
          type="submit"
          disabled={loading || !name || !email}
          className="w-full py-3 rounded-[14px] text-[13px] font-semibold tracking-wide transition-all disabled:opacity-40 active:scale-[0.98] text-white"
          style={{ background: '#C6862A' }}>
          {loading ? '...' : 'Devam Et'}
        </button>
      </form>
      <p className="text-center text-[11px] text-[#b5afa8] pb-4">Bilgileriniz güvende · Spam göndermiyoruz</p>
    </div>
  )
}

/* ── MODE SELECTOR ── */
function ModeSelector({ name, onSelect }: { name: string; onSelect: (m: string) => void }) {
  const modes = [
    { id: 'muadil', label: 'Muadil Sorgula', desc: 'Bildiğin bir parfümün muadilini bulalım' },
    { id: 'koku_testi', label: 'Koku Testine Başla', desc: '4 soruyla imza kokunu seçelim' },
    { id: 'soru', label: 'Soru Sor', desc: 'EDP/EDT, kalıcılık, kullanım hakkında' },
  ]
  return (
    <div className="msg-in mx-1 bg-white rounded-2xl border border-[#ede8e0] overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-5 pt-4 pb-3">
        <p className="font-semibold text-[#1a1a1a] text-[14px]">Harika, {name}!</p>
        <p className="text-[#6b6560] text-[13px] mt-0.5">Nasıl yardımcı olayım?</p>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="option-card w-full">
            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: '#C6862A' }} />
            <div>
              <p className="font-semibold text-[#1a1a1a] text-[13px]">{m.label}</p>
              <p className="text-[#6b6560] text-[12px] mt-0.5">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── PRODUCT CARD ── */
function ProductCard({ product, type = 'gold', coupon }: { product: ProductData; type?: string; coupon?: string }) {
  const label = type === 'home' ? 'Oda Kokusu Önerisi' : type === 'elegancia' ? 'Elegancia Premium' : 'Sizin İçin Seçildi'

  return (
    <div className="msg-in mx-1 bg-white rounded-2xl border border-[#ede8e0] overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="px-4 py-2 border-b border-[#f4f0ea]">
        <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: '#C6862A' }}>{label}</span>
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-20 h-24 object-cover rounded-xl border border-[#ede8e0]" />
            : <div className="w-20 h-24 rounded-xl bg-[#f4f0ea] flex items-center justify-center text-2xl">
                {type === 'home' ? '🕯️' : '🌸'}
              </div>
          }
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
          <a
            href={product.web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition active:scale-95"
            style={{ background: '#C6862A' }}>
            Ürüne Git
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
      <AyaAvatar size={30} />
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-[#ede8e0]"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex gap-1 items-center h-4">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
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
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, phase])

  async function handleLead(name: string, email: string) {
    const res = await fetch('/api/save-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await res.json()
    setLead({ name, email, lead_id: data.lead_id, session_id: data.session_id })
    setPhase('mode')
  }

  async function handleMode(mode: string) {
    setPhase('chat')
    const intros: Record<string, string> = {
      koku_testi: `Mükemmel! Sana en uygun kokuyu birlikte bulalım.\n\nBu parfümü günlük mü kullanacaksın, yoksa gece ve özel günler için mi arıyorsun?`,
      muadil: `Tabii! Hangi parfümün muadilini arıyorsun? Marka ve parfüm adını yaz, katalogumuzdan en yakın alternatifi bulayım.`,
      soru: `Elbette! Parfümler hakkında ne merak ediyorsun? Her şeyi sorabilirsin.`,
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
      const newMsg: Message = { role: 'assistant', content: data.output || '...', type: data.type }

      if ((data.type === 'recommendation' || data.type === 'elegancia' || data.type === 'home') && data.product) {
        newMsg.product = data.product
        if (data.type === 'recommendation' && lead) {
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  /* ─── RENDER ─── */
  return (
    <div className="fixed inset-0 flex" style={{ background: '#f9f7f4' }}>

      {/* ══ SOL PANEL — sadece desktop ══ */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r border-[#ede8e0]"
        style={{ background: '#fff' }}>

        <div className="flex flex-col h-full p-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{ background: '#C6862A' }}>
              A
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] text-sm leading-none">ASYA</p>
              <p className="text-[#b5afa8] text-[10px] tracking-wider uppercase mt-0.5">Koku Asistanı</p>
            </div>
          </Link>

          {/* Parfüm SVG */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'radial-gradient(circle, rgba(198,134,42,0.12) 0%, transparent 70%)' }} />
              <svg width="100" height="144" viewBox="0 0 96 140" fill="none">
                <rect x="32" y="2" width="32" height="22" rx="6" fill="#C6862A" opacity="0.9"/>
                <rect x="36" y="6" width="24" height="14" rx="4" fill="#f0d060" opacity="0.5"/>
                <rect x="36" y="22" width="24" height="14" rx="3" fill="#b07620"/>
                <rect x="8" y="36" width="80" height="96" rx="16" fill="url(#gs)"/>
                <rect x="14" y="42" width="10" height="36" rx="5" fill="white" opacity="0.07"/>
                <rect x="18" y="72" width="60" height="46" rx="8" fill="rgba(198,134,42,0.06)" stroke="rgba(198,134,42,0.25)" strokeWidth="1"/>
                <text x="48" y="90" textAnchor="middle" fill="#C6862A" fontSize="8" fontFamily="serif" letterSpacing="2">ELEGANCE</text>
                <text x="48" y="102" textAnchor="middle" fill="#C6862A" fontSize="5.5" fontFamily="serif" letterSpacing="1">VIP PERFUME</text>
                <text x="48" y="113" textAnchor="middle" fill="rgba(198,134,42,0.5)" fontSize="7" fontFamily="serif">ASYA</text>
                <defs>
                  <linearGradient id="gs" x1="8" y1="36" x2="88" y2="132" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f4f0ea"/>
                    <stop offset="50%" stopColor="#ede8e0"/>
                    <stop offset="100%" stopColor="#e4ddd3"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Bilgi */}
          <div className="space-y-3 mb-auto">
            <div className="nav-item cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-[13px]">Çevrimiçi · Hemen yanıt veriyor</span>
            </div>
            <div className="nav-item cursor-default">
              <div className="w-4 h-4 flex-shrink-0 text-[#b5afa8]">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.75 12h-1.5V7h1.5v5zm0-6.5h-1.5v-1.5h1.5v1.5z"/></svg>
              </div>
              <span className="text-[13px]">GPT-4o ile çalışıyor</span>
            </div>
            <div className="nav-item cursor-default">
              <div className="w-4 h-4 flex-shrink-0 text-[#b5afa8]">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 9a5.25 5.25 0 01-3.5-1.35 4 4 0 017 0A5.25 5.25 0 018 12.5z"/></svg>
              </div>
              <span className="text-[13px]">Kişisel öneri</span>
            </div>
          </div>

          {/* Alt */}
          <div className="border-t border-[#f0ece6] pt-5 mt-5">
            <p className="text-[11px] text-[#b5afa8] leading-relaxed">
              Elegance VIP Perfume
            </p>
            <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer"
              className="text-[11px] mt-1 block transition-colors hover:opacity-80"
              style={{ color: '#C6862A' }}>
              elegancevipperfume.com
            </a>
          </div>
        </div>
      </aside>

      {/* ══ SAĞ PANEL — CHAT ══ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#ede8e0] bg-white sticky top-0 z-20">
          <Link href="/" className="p-1.5 rounded-lg transition text-[#6b6560] hover:bg-[#f4f0ea]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <AyaAvatar size={34} />
          <div className="flex-1">
            <p className="font-semibold text-[#1a1a1a] text-sm leading-none">ASYA</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#C6862A' }}>Elegance VIP · Koku Asistanı</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-[#6b6560]">Çevrimiçi</span>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3.5 border-b border-[#ede8e0] bg-white">
          <div className="flex items-center gap-3">
            <AyaAvatar size={36} />
            <div>
              <p className="font-semibold text-[#1a1a1a] text-[14px] leading-none">ASYA — Koku Asistanı</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-[#6b6560]">Çevrimiçi</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium border"
              style={{ background: 'rgba(198,134,42,0.08)', borderColor: 'rgba(198,134,42,0.2)', color: '#C6862A' }}>
              AI Destekli
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] text-[#6b6560] bg-[#f4f0ea]">Güvenli</span>
          </div>
        </header>

        {/* Mesajlar */}
        <div className="flex-1 chat-scroll py-6 space-y-4" style={{ background: '#f9f7f4' }}>

          {/* Karşılama */}
          <div className="flex gap-3 items-end px-4 msg-in">
            <AyaAvatar size={30} />
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 border border-[#ede8e0] max-w-sm"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <p className="text-[#1a1a1a] text-[14px] leading-relaxed">
                Hoş geldiniz!<br/>
                Ben <span className="font-semibold">Elegance VIP Perfume</span> Koku Asistanı{' '}
                <span className="font-semibold" style={{ color: '#C6862A' }}>ASYA</span>.<br/>
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

          {/* Mesaj listesi */}
          {messages.map((msg, i) => (
            <div key={i} className="space-y-2">
              {msg.role === 'assistant' ? (
                <div className="flex gap-3 items-end px-4 msg-in">
                  <AyaAvatar size={30} />
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 border border-[#ede8e0] max-w-sm xl:max-w-md"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p className="text-[#1a1a1a] text-[14px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end px-4 msg-in">
                  <div className="px-4 py-3.5 rounded-2xl rounded-br-sm max-w-sm xl:max-w-md"
                    style={{ background: '#C6862A' }}>
                    <p className="text-white text-[14px] leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )}
              {msg.product && (
                <div className="px-4 pl-[52px]">
                  <ProductCard
                    product={msg.product}
                    type={msg.type === 'elegancia' ? 'elegancia' : msg.type === 'home' ? 'home' : 'gold'}
                    coupon={msg.type === 'recommendation' ? coupon || undefined : undefined}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Mode selector */}
          {phase === 'mode' && lead && (
            <div className="px-4 pl-[52px]">
              <ModeSelector name={lead.name} onSelect={handleMode} />
            </div>
          )}

          {/* Typing */}
          {loading && <Typing />}

          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Input */}
        {phase === 'chat' && (
          <div className="border-t border-[#ede8e0] bg-white px-4 py-3">
            <div className="flex gap-2 items-end max-w-2xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Mesajınızı yazın..."
                disabled={loading}
                rows={1}
                className="chat-input flex-1"
                style={{ minHeight: 44, maxHeight: 160 }}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="send-btn flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
        )}
      </div>
    </div>
  )
}
