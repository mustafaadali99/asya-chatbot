'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface LeadFormProps {
  onSubmit: (name: string, email: string) => void
}

export default function LeadForm({ onSubmit }: LeadFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir email adresi girin')
      return
    }

    setLoading(true)
    setError('')
    onSubmit(name.trim(), email.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mx-2"
    >
      <div className="mb-4">
        <p className="font-semibold text-stone-800 text-[15px]">Başlamadan önce küçük bir rica 😊</p>
        <p className="text-stone-500 text-sm mt-1 leading-relaxed">
          Adınızı ve e-posta adresinizi alabilir miyim?<br />
          Seçtiğimiz kokunun linkini size özel olarak maille de göndermek istiyorum 💌
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Adınız Soyadınız"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
          required
        />
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
          required
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading || !name || !email}
          className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide disabled:opacity-50 hover:bg-stone-800 active:scale-[0.98] transition-all"
        >
          {loading ? 'Kaydediliyor...' : 'Devam Et ✨'}
        </button>
      </form>
      <p className="text-stone-400 text-xs text-center mt-3">Bilgileriniz güvende, spam göndermiyoruz 🔒</p>
    </motion.div>
  )
}
