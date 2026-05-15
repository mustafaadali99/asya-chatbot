import goldData from '@/data/gold_catalog.json'
import eleganciaData from '@/data/elegancia_catalog.json'
import homeData from '@/data/home_catalog.json'

export interface Product {
  id?: string
  woo_id?: number
  code: string
  name: string
  series?: 'gold' | 'elegancia'
  gender: 'erkek' | 'kadın' | 'unisex'
  original_name?: string
  original_brand?: string
  scent_family: string
  top_notes: string[]
  heart_notes: string[]
  base_notes: string[]
  longevity?: string
  sillage?: string
  occasion: string[]
  season: string[]
  mood_tags: string[]
  effect?: 'temiz_zarif' | 'karizmatik_dikkat_cekici'
  volume?: string
  image_url: string
  web_url: string
  stock_status?: string
  is_active?: boolean
  in_stock?: boolean
}

export interface HomeProduct {
  id?: string
  woo_id?: number
  name: string
  scent_name?: string
  scent_family: string
  top_notes: string[]
  heart_notes: string[]
  base_notes: string[]
  mood_tags: string[]
  room_type: string[]
  image_url: string
  web_url: string
  stock_status?: string
  is_active?: boolean
  in_stock?: boolean
}

export interface ScentProfile {
  gender?: string
  usage?: string
  scent_direction?: string
  deepener?: string
  effect?: string
  season?: string
  performance?: string
}

const gold = goldData as unknown as Product[]
const elegancia = eleganciaData as unknown as Product[]
const home = homeData as unknown as HomeProduct[]

function scoreProduct(product: Product, profile: ScentProfile): number {
  let score = 0

  if (profile.gender) {
    if (product.gender === profile.gender) score += 5
    else if (product.gender === 'unisex') score += 2
    else return -999
  }

  if (profile.scent_direction && product.scent_family) {
    const dirMap: Record<string, string[]> = {
      fresh: ['fresh', 'aquatic', 'aromatic', 'fougere'],
      odunsu: ['woody', 'chypre', 'aromatic'],
      baharatli: ['spicy', 'oriental'],
      tatli: ['gourmand', 'oriental', 'powdery'],
      ciceksi: ['floral', 'powdery'],
      meyvemsi: ['fruity', 'floral', 'fresh'],
    }
    const match = Object.entries(dirMap).find(([key]) =>
      profile.scent_direction!.includes(key)
    )
    if (match && match[1].some(f => product.scent_family.includes(f))) score += 3
  }

  if (profile.deepener) {
    const allNotes = [...product.top_notes, ...product.heart_notes, ...product.base_notes]
      .join(' ').toLowerCase()
    if (allNotes.includes(profile.deepener.toLowerCase())) score += 3
  }

  if (profile.effect && product.effect === profile.effect) score += 2

  if (profile.usage) {
    if (product.occasion?.some(o => o.includes(profile.usage!))) score += 2
  }

  if (profile.season) {
    if (product.season?.some(s => s.includes(profile.season!))) score += 1
  }

  return score
}

function scoreHome(product: HomeProduct, profile: ScentProfile): number {
  let score = 0

  if (profile.scent_direction) {
    const dirMap: Record<string, string[]> = {
      fresh: ['ferah', 'deniz', 'narenciye', 'aromatik'],
      odunsu: ['odunsu', 'sandal', 'oryantal'],
      tatli: ['tatlı', 'gourmand', 'vanilya'],
      ciceksi: ['çiçeksi', 'floral', 'gül', 'lavanta'],
      meyvemsi: ['meyvemsi', 'tropikal', 'meyve'],
    }
    const match = Object.entries(dirMap).find(([key]) =>
      profile.scent_direction!.includes(key)
    )
    if (match && match[1].some(f => product.scent_family.toLowerCase().includes(f))) score += 3
  }

  if (profile.deepener) {
    const allNotes = [...product.top_notes, ...product.heart_notes, ...product.base_notes]
      .join(' ').toLowerCase()
    if (allNotes.includes(profile.deepener.toLowerCase())) score += 3
  }

  if (profile.effect) {
    const effectMap: Record<string, string[]> = {
      temiz_zarif: ['zarif', 'temiz', 'huzurlu', 'ferah'],
      karizmatik_dikkat_cekici: ['egzotik', 'güçlü', 'seksi', 'karizmatik'],
    }
    const tags = effectMap[profile.effect] || []
    if (product.mood_tags?.some(t => tags.includes(t))) score += 2
  }

  return score
}

function isAvailable(p: { is_active?: boolean; in_stock?: boolean; stock_status?: string }): boolean {
  if (p.stock_status === 'outofstock') return false
  if (p.in_stock === false) return false
  if (p.is_active === false) return false
  return true
}

export function findGoldProduct(profile: ScentProfile): Product | null {
  const filtered = gold.filter(isAvailable)
  const scored = filtered.map(p => ({ p, score: scoreProduct(p, profile) }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.p || null
}

export function findEleganciaProduct(profile: ScentProfile): Product | null {
  const filtered = elegancia.filter(isAvailable)
  const scored = filtered.map(p => ({ p, score: scoreProduct(p, profile) }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.p || null
}

export function findHomeProduct(profile: ScentProfile): HomeProduct | null {
  const filtered = home.filter(isAvailable)
  const scored = filtered.map(p => ({ p, score: scoreHome(p, profile) }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.p || null
}

export function findByOriginalName(query: string, gender?: string): Product | null {
  const q = query.toLowerCase()
  const all = [...gold, ...elegancia]
  const candidates = all.filter(p => {
    const nameMatch = p.original_name?.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q)
    if (!nameMatch) return false
    if (gender === 'erkek') return p.gender === 'erkek' || p.gender === 'unisex'
    if (gender === 'kadın') return p.gender === 'kadın' || p.gender === 'unisex'
    return true
  })
  return candidates[0] || null
}
