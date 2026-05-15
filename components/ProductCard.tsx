'use client'
import { motion } from 'framer-motion'

interface ProductCardProps {
  name: string
  imageUrl: string
  webUrl: string
  topNotes?: string[]
  heartNotes?: string[]
  baseNotes?: string[]
  couponCode?: string
  type?: 'gold' | 'elegancia' | 'home'
}

export default function ProductCard({
  name, imageUrl, webUrl, topNotes, heartNotes, baseNotes, couponCode, type = 'gold'
}: ProductCardProps) {
  const isHome = type === 'home'
  const isElegancia = type === 'elegancia'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-stone-100 mx-2 my-1"
    >
      {/* Üst banner */}
      <div className={`px-4 py-2 text-xs tracking-[2px] uppercase font-medium ${
        isElegancia ? 'bg-stone-900 text-amber-400' :
        isHome ? 'bg-emerald-50 text-emerald-700' :
        'bg-amber-50 text-amber-700'
      }`}>
        {isElegancia ? '✦ Elegancia Premium' : isHome ? '🏠 Oda Kokusu Önerisi' : '⭐ Sizin İçin Seçildi'}
      </div>

      <div className="flex gap-3 p-4">
        {/* Ürün görseli */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-24 h-28 object-cover rounded-xl border border-stone-100"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-24 h-28 bg-stone-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">{isHome ? '🪔' : '🌸'}</span>
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 text-sm leading-tight">{name}</p>

          {/* Notalar */}
          {(topNotes || heartNotes || baseNotes) && (
            <div className="mt-2 space-y-0.5">
              {topNotes && topNotes.length > 0 && (
                <p className="text-xs text-stone-500">
                  <span className="text-stone-400">Üst:</span> {topNotes.join(', ')}
                </p>
              )}
              {heartNotes && heartNotes.length > 0 && (
                <p className="text-xs text-stone-500">
                  <span className="text-stone-400">Kalp:</span> {heartNotes.join(', ')}
                </p>
              )}
              {baseNotes && baseNotes.length > 0 && (
                <p className="text-xs text-stone-500">
                  <span className="text-stone-400">Alt:</span> {baseNotes.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Kupon */}
          {couponCode && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <p className="text-xs text-amber-700 font-medium">🎁 Size özel %10 indirim</p>
              <p className="text-sm font-bold text-amber-800 tracking-widest">{couponCode}</p>
            </div>
          )}

          {/* Buton */}
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
              isElegancia
                ? 'bg-stone-900 text-amber-400 hover:bg-stone-800'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            Ürüne Git ✨
          </a>
        </div>
      </div>
    </motion.div>
  )
}
