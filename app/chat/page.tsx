'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LeadForm from '@/components/LeadForm'
import ModeSelector from '@/components/ModeSelector'
import ProductCard from '@/components/ProductCard'

interface Message {
  role: 'assistant' | 'user'
  content: string
  component?: React.ReactNode
}

interface LeadInfo {
  name: string
  email: string
  lead_id: string
  session_id: string
}

export default function ChatPage() {
  const [lead, setLead] = useState<LeadInfo | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [phase, setPhase] = useState<'greeting' | 'lead' | 'mode' | 'chat'>('greeting')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, phase])

  // Karşılama mesajı
  useEffect(() => {
    const timer = setTimeout(() => setPhase('lead'), 800)
    return () => clearTimeout(timer)
  }, [])

  async function handleLeadSubmit(name: string, email: string) {
    const res = await fetch('/api/save-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await res.json()
    setLead({ name, email, lead_id: data.lead_id, session_id: data.session_id })
    setPhase('mode')

    setMessages([{
      role: 'assistant',
      content: `Harika ${name} ✨ Şimdi devam etmeden önce küçük bir seçim yapalım:`,
    }])
  }

  async function handleModeSelect(selectedMode: 'koku_testi' | 'muadil' | 'soru') {
    setMode(selectedMode)
    setPhase('chat')

    const modeMessages: Record<string, string> = {
      koku_testi: `Mükemmel ${lead?.name}! 🌸 Sana en uygun kokuyu birlikte bulalım. Başlamadan şunu merak ettim — bu parfümü genellikle ne zaman kullanmayı düşünüyorsun? Günlük/ofis rutini mi, yoksa gece ve özel günler için mi arıyorsun?`,
      muadil: `Tabii ${lead?.name}! 🔍 Hangi parfümün muadilini arıyorsun? Marka ve parfüm adını yaz, ben de katalogumuzdan en yakın alternatifi bulayım.`,
      soru: `Elbette ${lead?.name}! 💬 Parfümler hakkında ne merak ediyorsun? EDP/EDT farkı, kalıcılık, uygulama noktaları... Her şeyi sorabilirsin.`,
    }

    const firstMsg = modeMessages[selectedMode]
    setMessages(prev => [...prev, { role: 'assistant', content: firstMsg }])
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    inputRef.current?.focus()

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()
      const assistantContent = data.output || 'Anlayamadım, tekrar dener misin? 😊'

      let component: React.ReactNode | undefined

      if (data.type === 'recommendation' && data.product) {
        // Email & kupon gönder
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: lead?.name,
            email: lead?.email,
            lead_id: lead?.lead_id,
            session_id: lead?.session_id,
            gold_code: data.product.code,
            gold_name: data.product.name,
            gold_url: data.product.web_url,
            gold_woo_id: data.product.woo_id,
            gold_image: data.product.image_url,
            scent_profile: data.scent_profile,
            scent_story: assistantContent,
          }),
        }).then(r => r.json()).then(d => {
          if (d.coupon_code) setCouponCode(d.coupon_code)
        })

        component = (
          <ProductCard
            name={data.product.name}
            imageUrl={data.product.image_url}
            webUrl={data.product.web_url}
            topNotes={data.product.top_notes}
            heartNotes={data.product.heart_notes}
            baseNotes={data.product.base_notes}
            type="gold"
          />
        )
      } else if (data.type === 'elegancia' && data.product) {
        component = (
          <ProductCard
            name={data.product.name}
            imageUrl={data.product.image_url}
            webUrl={data.product.web_url}
            topNotes={data.product.top_notes}
            heartNotes={data.product.heart_notes}
            baseNotes={data.product.base_notes}
            type="elegancia"
          />
        )
      } else if (data.type === 'home' && data.product) {
        component = (
          <ProductCard
            name={data.product.name}
            imageUrl={data.product.image_url}
            webUrl={data.product.web_url}
            type="home"
          />
        )
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        component,
      }])

      // Kupon kodu gelince göster
      if (couponCode && data.type === 'recommendation') {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `🎁 Size özel indirim kodunuz hazır! Kupon: **${couponCode}** — 3 gün geçerli, tek kullanım.`,
          }])
        }, 2000)
      }

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Bir sorun oluştu 😊 Lütfen tekrar deneyin.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5f3f0] max-w-lg mx-auto relative">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100 shadow-sm sticky top-0 z-10">
        <Link href="/" className="p-2 rounded-xl hover:bg-stone-100 transition text-stone-500 text-sm font-medium">
          ← Geri
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm leading-none">ELEGANCE VIP</p>
            <p className="text-amber-500 text-xs font-medium">AI Scent Assistant — ASYA</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-stone-400">Çevrimiçi</span>
        </div>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 px-2">

        {/* Karşılama balonu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 items-end"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
            <p className="text-stone-700 text-sm leading-relaxed">
              Hoş geldiniz 🌸<br />
              Ben <strong>Elegance VIP Perfume</strong> Koku Asistanınız ASYA.<br />
              Ruhunuza en uygun kokuyu birlikte bulmaya ne dersiniz?
            </p>
          </div>
        </motion.div>

        {/* Lead Form */}
        <AnimatePresence>
          {phase === 'lead' && <LeadForm onSubmit={handleLeadSubmit} />}
        </AnimatePresence>

        {/* Mesajlar */}
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'assistant' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 items-end"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                  <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-stone-800 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                  <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            )}
            {msg.component && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                {msg.component}
              </motion.div>
            )}
          </div>
        ))}

        {/* Mod seçici */}
        <AnimatePresence>
          {phase === 'mode' && <ModeSelector onSelect={handleModeSelect} />}
        </AnimatePresence>

        {/* Yükleniyor */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-end"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {phase === 'chat' && (
        <div className="sticky bottom-0 bg-white border-t border-stone-100 px-3 py-3">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-stone-900 flex items-center justify-center disabled:opacity-40 hover:bg-stone-700 active:scale-95 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
