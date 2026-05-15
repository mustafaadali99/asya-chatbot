'use client'
import { motion } from 'framer-motion'

interface ModeSelectorProps {
  onSelect: (mode: 'koku_testi' | 'muadil' | 'soru') => void
}

const modes = [
  {
    id: 'muadil' as const,
    title: 'Muadil Sorgula',
    desc: 'Bildiğin bir parfümün muadilini bulalım.',
    icon: '🔍',
  },
  {
    id: 'koku_testi' as const,
    title: 'Koku Testine Başla',
    desc: '4 kısa soruyla imza kokunu seçelim.',
    icon: '✨',
  },
  {
    id: 'soru' as const,
    title: 'Parfüm Hakkında Soru Sor',
    desc: 'EDP/EDT, kalıcılık, kullanım... Merak ettiklerini sor.',
    icon: '💬',
  },
]

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mx-2"
    >
      <p className="font-semibold text-stone-800 text-[15px] mb-1">Nasıl yardımcı olayım? ✨</p>
      <p className="text-stone-400 text-xs mb-4">3 seçenekten birini seç, hemen başlayalım.</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(mode.id)}
            className="text-left p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50 active:scale-95 transition-all group"
          >
            <span className="text-xl mb-1 block">{mode.icon}</span>
            <p className="font-semibold text-stone-800 text-sm">{mode.title}</p>
            <p className="text-stone-400 text-xs mt-0.5 leading-relaxed">{mode.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
