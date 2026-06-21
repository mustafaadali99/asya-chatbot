/**
 * lib/product-catalog.ts
 *
 * Supabase'den product_catalog tablosunu okur.
 * Next.js Data Cache ile 1 saatte bir yenilenir → Supabase'e saatte 1 istek.
 *
 * - getProductLookup()     → enrichment için woo_id/img/url/series haritası
 * - getWooOnlyProducts()   → JSON'da olmayan, sadece WooCommerce kaynaklı ürünler
 *                            (sistem prompt'a eklenir; yeni ürünler otomatik görünür)
 */

import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getClient() {
  return createClient(supabaseUrl, supabaseKey)
}

export interface CatalogProduct {
  id: string
  woo_id: number | null
  sku: string | null
  name: string
  series: string | null
  gender: string | null
  category: string | null
  scent_family: string | null
  top_notes: string[] | null
  heart_notes: string[] | null
  base_notes: string[] | null
  muadil: string | null
  price: number | null
  in_stock: boolean
  image_url: string | null
  web_url: string | null
  source: string
}

export type ProductLookupEntry = {
  img: string
  url: string
  woo_id?: number
  series: string
  price?: number
}

/* ─────────────────────────────────────────────────────────────
   RAW Supabase fetchers (çağrılmamalı doğrudan — cached wrapper kullan)
   ───────────────────────────────────────────────────────────── */

async function _fetchLookupData(): Promise<Record<string, ProductLookupEntry>> {
  const { data, error } = await getClient()
    .from('product_catalog')
    .select('woo_id, sku, name, series, image_url, web_url, price, in_stock')
    .eq('in_stock', true)
    .eq('is_active', true)
    .order('name')

  if (error || !data) return {}

  const map: Record<string, ProductLookupEntry> = {}

  for (const p of data) {
    const entry: ProductLookupEntry = {
      img:    p.image_url || '',
      url:    p.web_url   || '',
      series: p.series    || 'gold',
      price:  p.price     || undefined,
    }
    if (p.woo_id) entry.woo_id = p.woo_id

    // SKU key
    if (p.sku) map[p.sku.toLowerCase()] = entry

    // Full name key
    const baseName = (p.name || '').split('–')[0].trim()
    map[baseName.toLowerCase()] = entry

    // Short first-word key (e.g. "Magic" for "Magic Eau De Parfum")
    const shortName = baseName.split(' ')[0].toLowerCase()
    if (shortName.length > 3 && !map[shortName]) map[shortName] = entry

    // woo_id direct key
    if (p.woo_id) map[`woo_${p.woo_id}`] = entry
  }

  return map
}

async function _fetchWooOnlyProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await getClient()
    .from('product_catalog')
    .select('*')
    .eq('source', 'woocommerce')
    .eq('in_stock', true)
    .order('category', { ascending: true })
    .order('name',     { ascending: true })

  if (error || !data) return []
  return data as CatalogProduct[]
}

/* ─────────────────────────────────────────────────────────────
   Cached wrappers — Next.js Data Cache, 1 saat (3600s) TTL
   Supabase'e saatte en fazla 1 istek gider → limit sorunu yok
   ───────────────────────────────────────────────────────────── */

/**
 * Tüm aktif ürünlerden enrichment haritası.
 * Resimler/URL'ler WooCommerce'deki güncel haliyle gelir (gece sync günceller).
 * Cache: 1 saat — her yeni serverless instance'da 1 Supabase isteği.
 */
export const getProductLookup = unstable_cache(
  _fetchLookupData,
  ['product-lookup'],
  { revalidate: 3600, tags: ['product-catalog'] },
)

/**
 * JSON'da olmayan WooCommerce ürünleri — yeni eklenen ürünler dahil.
 * ASYA'nın sistem prompt'una eklenerek otomatik tavsiye edilebilir hale gelir.
 * Cache: 1 saat.
 */
export const getWooOnlyProducts = unstable_cache(
  _fetchWooOnlyProducts,
  ['woo-only-products'],
  { revalidate: 3600, tags: ['product-catalog'] },
)
