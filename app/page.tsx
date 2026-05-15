'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SplashPage() {
  const router = useRouter()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0608 0%, #150d10 40%, #0d0a12 100%)' }}>

      {/* Arka plan orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb-1 absolute w-[600px] h-[600px] rounded-full -top-32 -left-32 opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(180,130,50,0.3) 0%, transparent 70%)' }} />
        <div className="orb-2 absolute w-[500px] h-[500px] rounded-full -bottom-20 -right-20 opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(120,60,100,0.4) 0%, transparent 70%)' }} />
        <div className="orb-3 absolute w-[300px] h-[300px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(200,160,80,0.5) 0%, transparent 70%)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* İçerik */}
      <div className="relative z-10 text-center px-8 flex flex-col items-center">

        {/* Şişe ikonу */}
        <div className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative mx-auto mb-8">
            {/* Parlama halkası */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-amber-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="relative w-24 h-24 mx-auto">
              <svg viewBox="0 0 96 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Kapak */}
                <rect x="32" y="2" width="32" height="22" rx="6" fill="#c9a227" opacity="0.9"/>
                <rect x="36" y="6" width="24" height="14" rx="4" fill="#f0d060" opacity="0.6"/>
                {/* Boyun */}
                <rect x="36" y="22" width="24" height="14" rx="3" fill="#b8921e"/>
                {/* Gövde */}
                <rect x="8" y="36" width="80" height="96" rx="16" fill="url(#g1)"/>
                {/* Cam parlaması */}
                <rect x="14" y="42" width="12" height="40" rx="6" fill="white" opacity="0.08"/>
                {/* Etiket */}
                <rect x="18" y="72" width="60" height="46" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(201,162,39,0.3)" strokeWidth="1"/>
                <text x="48" y="90" textAnchor="middle" fill="#c9a227" fontSize="8" fontFamily="serif" letterSpacing="2">ELEGANCE</text>
                <text x="48" y="102" textAnchor="middle" fill="#c9a227" fontSize="5.5" fontFamily="serif" letterSpacing="1">VIP PERFUME</text>
                <text x="48" y="113" textAnchor="middle" fill="rgba(201,162,39,0.5)" fontSize="7" fontFamily="serif">ASYA</text>
                <defs>
                  <linearGradient id="g1" x1="8" y1="36" x2="88" y2="132" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2a1f2e"/>
                    <stop offset="50%" stopColor="#1a1220"/>
                    <stop offset="100%" stopColor="#0d0a12"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Marka */}
        <div className={`transition-all duration-700 delay-300 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-amber-400/50 text-[10px] tracking-[6px] uppercase mb-3 font-light">
            Elegance VIP Perfume
          </p>
          <h1 className="shimmer-text text-6xl font-thin tracking-[12px] uppercase mb-1">
            ASYA
          </h1>
          <p className="text-white/30 text-xs tracking-[3px] font-light mt-2">
            AI Koku Asistanı
          </p>
        </div>

        {/* Divider */}
        <div className={`transition-all duration-700 delay-500 my-8 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
            <div className="w-1 h-1 rounded-full bg-amber-500/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        </div>

        {/* CTA */}
        <div className={`transition-all duration-700 delay-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => router.push('/chat')}
            className="group relative px-10 py-4 rounded-full text-sm font-medium tracking-widest uppercase overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a227, #f0d060, #c9a227)', color: '#0a0608' }}
          >
            <span className="relative z-10">Başlayalım</span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
          </button>

          <p className="mt-6 text-white/20 text-[11px] tracking-wider">
            Ruhunuza en uygun koku sizi bekliyor
          </p>
        </div>
      </div>
    </main>
  )
}
