'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PerfumeAnimation from '@/components/PerfumeAnimation'

export default function Home() {
  const [animDone, setAnimDone] = useState(false)
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center relative overflow-hidden">
      <PerfumeAnimation onComplete={() => setAnimDone(true)} />

      {animDone && (
        <div className="text-center px-6 z-10">
          <p className="text-amber-400/60 text-xs tracking-[4px] uppercase mb-3">Elegance VIP Perfume</p>
          <h1 className="text-white text-3xl font-light tracking-wide mb-2">ASYA</h1>
          <p className="text-stone-400 text-sm mb-8">AI Koku Asistanınız size özel parfümü buluyor</p>

          <button
            onClick={() => router.push('/chat')}
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-8 py-3.5 rounded-full text-sm tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
          >
            Başlayalım ✨
          </button>

          <p className="text-stone-600 text-xs mt-6">
            <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 transition">
              www.elegancevipperfume.com
            </a>
          </p>
        </div>
      )}
    </main>
  )
}
