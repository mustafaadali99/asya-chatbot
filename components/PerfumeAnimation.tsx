'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PerfumeAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'bottle' | 'spray' | 'done'>('bottle')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('spray'), 1200)
    const t2 = setTimeout(() => setPhase('done'), 2800)
    const t3 = setTimeout(onComplete, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0d1a]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Parfüm şişesi */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Şişe SVG */}
            <svg width="80" height="140" viewBox="0 0 80 140" fill="none">
              {/* Kapak */}
              <rect x="28" y="4" width="24" height="18" rx="4" fill="#d4af37" />
              {/* Boyun */}
              <rect x="32" y="18" width="16" height="12" rx="2" fill="#c8a230" />
              {/* Gövde */}
              <rect x="12" y="30" width="56" height="90" rx="12" fill="url(#bottleGrad)" />
              {/* Etiket */}
              <rect x="20" y="60" width="40" height="44" rx="6" fill="rgba(255,255,255,0.15)" />
              <text x="40" y="80" textAnchor="middle" fill="#d4af37" fontSize="7" fontFamily="serif">ELEGANCE</text>
              <text x="40" y="91" textAnchor="middle" fill="#d4af37" fontSize="5" fontFamily="serif">VIP PERFUME</text>
              <text x="40" y="100" textAnchor="middle" fill="rgba(212,175,55,0.7)" fontSize="4">ASYA</text>
              <defs>
                <linearGradient id="bottleGrad" x1="12" y1="30" x2="68" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1a1a3e" />
                  <stop offset="100%" stopColor="#0d0d1a" />
                </linearGradient>
              </defs>
            </svg>

            {/* Spray partikülleri */}
            <AnimatePresence>
              {phase === 'spray' && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: Math.random() * 6 + 2,
                        height: Math.random() * 6 + 2,
                        background: `hsla(${45 + Math.random() * 20}, 80%, 60%, 0.8)`,
                        left: '50%',
                        top: '10px',
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: (Math.random() - 0.5) * 120,
                        y: -Math.random() * 100 - 20,
                        opacity: 0,
                        scale: 0.3,
                      }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.05 }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Marka yazısı */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-[#d4af37] text-xs tracking-[4px] uppercase">Elegance VIP Perfume</p>
            <motion.p
              className="text-white text-xl mt-2 font-light tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              ASYA
            </motion.p>
            <motion.p
              className="text-[#d4af37]/60 text-xs tracking-[2px] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              AI Koku Asistanınız
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
