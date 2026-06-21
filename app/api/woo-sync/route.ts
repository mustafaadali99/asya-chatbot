import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

const WOO_URL    = process.env.WC_SITE_URL || 'https://www.elegancevipperfume.com'
const WOO_KEY    = process.env.WC_CONSUMER_KEY || ''
const WOO_SECRET = process.env.WC_CONSUMER_SECRET || ''

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/* ─── WooCommerce helpers ─────────────────────────────────────────── */

interface WooProduct {
  id: number
  name: string
  slug: string
  permalink: string
  status: string
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  stock_status: string
  categories: Array<{ id: number; name: string; slug: string }>
  images: Array<{ src: string }>
}

async function fetchAllWooProducts(): Promise<WooProduct[]> {
  const all: WooProduct[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = new URL(`${WOO_URL}/wp-json/wc/v3/products`)
    url.searchParams.set('consumer_key', WOO_KEY)
    url.searchParams.set('consumer_secret', WOO_SECRET)
    url.searchParams.set('status', 'publish')
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('page', String(page))

    let res: Response | undefined
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(url.toString(), {
          headers: { 'User-Agent': 'ASYA-WooSync/1.0' },
          signal: AbortSignal.timeout(30_000),
        })
        break
      } catch {
        if (attempt === 2) throw new Error(`WooCommerce fetch failed after 3 attempts (page ${page})`)
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      }
    }

    if (!res || !res.ok) {
      throw new Error(`WooCommerce API error: ${res?.status} ${res?.statusText}`)
    }

    const products: WooProduct[] = await res.json()
    if (!products.length) break

    all.push(...products)
    if (products.length < perPage) break
    page++
    await new Promise(r => setTimeout(r, 300)) // Rate limit
  }

  return all
}

/* ─── AI metadata inference ───────────────────────────────────────── */

interface ProductMeta {
  series: string | null
  gender: string | null
  category: string
  scent_family: string | null
  top_notes: string[] | null
  heart_notes: string[] | null
  base_notes: string[] | null
}

async function inferProductMeta(
  name: string,
  description: string,
  wooCategory: string,
): Promise<ProductMeta> {
  const prompt = `Sen bir parfüm uzmanısın. Aşağıdaki ürün adı ve açıklamasına bakarak JSON formatında meta bilgi çıkar.

Ürün Adı: ${name}
Açıklama: ${description.slice(0, 600)}
WooCommerce Kategorisi: ${wooCategory}

Şu alanları doldur (bilinmiyorsa null):
- series: "gold" | "elegancia" | "hunter" | "home" | null
- gender: "erkek" | "kadin" | "unisex" | null (ev kokuları için null)
- category: "Erkek Parfüm" | "Kadın Parfüm" | "Unisex Parfüm" | "Oda Kokusu" | "Ev Kokusu" | "Oto Kokusu" | "Diğer"
- scent_family: "floral" | "woody" | "fresh" | "oriental" | "gourmand" | "citrus" | "aquatic" | "musky" | null
- top_notes: string[] (bulunanlar) | null
- heart_notes: string[] (bulunanlar) | null
- base_notes: string[] (bulunanlar) | null

Sadece JSON döndür, başka metin yok.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.2,
    })
    const raw = response.choices[0]?.message?.content || '{}'
    return JSON.parse(raw) as ProductMeta
  } catch {
    // Fallback: derive from category name
    const lname = name.toLowerCase()
    const isHome = lname.includes('reed') || lname.includes('oda') || lname.includes('spray') || lname.includes('bambu')
    const isOto  = lname.includes('oto') || lname.includes('araba') || lname.includes('araç')
    return {
      series:      isHome ? 'home' : null,
      gender:      null,
      category:    isHome ? 'Oda Kokusu' : isOto ? 'Oto Kokusu' : 'Diğer',
      scent_family: null,
      top_notes:   null,
      heart_notes: null,
      base_notes:  null,
    }
  }
}

/* ─── Route handler ───────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  // Auth: accept cron secret or manual trigger with ?secret=...
  const auth   = req.headers.get('authorization')
  const qsec   = req.nextUrl.searchParams.get('secret')
  const cronSec = process.env.CRON_SECRET || ''

  if (auth !== `Bearer ${cronSec}` && qsec !== cronSec) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    // 1. Fetch all WooCommerce products
    console.log('[woo-sync] Fetching WooCommerce products...')
    const wooProducts = await fetchAllWooProducts()
    console.log(`[woo-sync] Fetched ${wooProducts.length} products from WooCommerce`)

    // 2. Get existing woo_ids from product_catalog
    const { data: existingRows } = await supabase
      .from('product_catalog')
      .select('woo_id, scent_family, series, gender')
      .not('woo_id', 'is', null)

    const existingMap = new Map<number, { scent_family: string | null; series: string | null; gender: string | null }>()
    for (const row of existingRows || []) {
      existingMap.set(row.woo_id, {
        scent_family: row.scent_family,
        series:       row.series,
        gender:       row.gender,
      })
    }

    // 3. Separate new vs existing products
    const newProducts     = wooProducts.filter(p => !existingMap.has(p.id))
    const updateProducts  = wooProducts.filter(p =>  existingMap.has(p.id))

    console.log(`[woo-sync] New: ${newProducts.length}, Update: ${updateProducts.length}`)

    // 4. Upsert existing products (price, stock, image update only — don't overwrite scent metadata)
    let updatedCount = 0
    const updateBatch = updateProducts.map(p => ({
      woo_id:         p.id,
      name:           p.name,
      sku:            p.sku || null,
      price:          p.price ? parseFloat(p.price) : null,
      in_stock:       p.stock_status === 'instock',
      image_url:      p.images?.[0]?.src || null,
      web_url:        p.permalink,
      last_synced_at: new Date().toISOString(),
      source:         'woocommerce',
    }))

    if (updateBatch.length > 0) {
      const { error: updateErr } = await supabase
        .from('product_catalog')
        .upsert(updateBatch, { onConflict: 'woo_id', ignoreDuplicates: false })
      if (updateErr) console.error('[woo-sync] Update error:', updateErr.message)
      else updatedCount = updateBatch.length
    }

    // 5. Process new products: infer metadata with AI, then insert
    let insertedCount = 0
    const aiErrors: string[] = []

    // Process in batches of 5 to avoid OpenAI rate limits
    for (let i = 0; i < newProducts.length; i += 5) {
      const batch = newProducts.slice(i, i + 5)

      const insertRows = await Promise.all(
        batch.map(async (p) => {
          const wooCategory = p.categories?.[0]?.name || ''
          const description = (p.short_description || p.description || '').replace(/<[^>]+>/g, '')

          let meta: ProductMeta
          try {
            meta = await inferProductMeta(p.name, description, wooCategory)
          } catch (e) {
            aiErrors.push(p.name)
            meta = {
              series:      null,
              gender:      null,
              category:    wooCategory || 'Diğer',
              scent_family: null,
              top_notes:   null,
              heart_notes: null,
              base_notes:  null,
            }
          }

          return {
            woo_id:         p.id,
            sku:            p.sku || null,
            name:           p.name,
            series:         meta.series,
            gender:         meta.gender,
            category:       meta.category,
            scent_family:   meta.scent_family,
            top_notes:      meta.top_notes,
            heart_notes:    meta.heart_notes,
            base_notes:     meta.base_notes,
            price:          p.price ? parseFloat(p.price) : null,
            in_stock:       p.stock_status === 'instock',
            image_url:      p.images?.[0]?.src || null,
            web_url:        p.permalink,
            description_tr: description.slice(0, 1000) || null,
            source:         'woocommerce',
            last_synced_at: new Date().toISOString(),
          }
        })
      )

      const { error: insertErr } = await supabase
        .from('product_catalog')
        .upsert(insertRows, { onConflict: 'woo_id', ignoreDuplicates: false })

      if (insertErr) {
        console.error('[woo-sync] Insert error:', insertErr.message)
        aiErrors.push(`batch-${i}: ${insertErr.message}`)
      } else {
        insertedCount += insertRows.length
      }

      // Small delay between batches
      if (i + 5 < newProducts.length) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    // 6. Final count
    const { count: totalCount } = await supabase
      .from('product_catalog')
      .select('*', { count: 'exact', head: true })

    const summary = {
      success:        true,
      wooTotal:       wooProducts.length,
      catalogTotal:   totalCount,
      inserted:       insertedCount,
      updated:        updatedCount,
      aiErrors:       aiErrors.length > 0 ? aiErrors : undefined,
      syncedAt:       new Date().toISOString(),
    }

    // 7. Yeni ürün eklendiyse Next.js cache'i geçersiz kıl
    //    → chat route'u bir sonraki istekte Supabase'den taze veri çeker
    if (insertedCount > 0) {
      revalidateTag('product-catalog', 'default')
      console.log('[woo-sync] Cache invalidated — new products added')
    }

    console.log('[woo-sync] Done:', summary)
    return NextResponse.json(summary)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[woo-sync] Fatal error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
