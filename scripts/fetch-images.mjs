/**
 * fetch-images.mjs
 * Fetches og:image from product pages for entries missing image_url
 */
import { readFileSync, writeFileSync } from 'fs'

const goldCatalog = JSON.parse(readFileSync('data/gold_catalog.json', 'utf8'))
const missing = goldCatalog.filter(p => !p.image_url && p.web_url)

console.log(`Fetching images for ${missing.length} products...`)

const OG_IMAGE_RE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
const OG_IMAGE_RE2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
const WP_IMAGE_RE = /class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>.*?<img[^>]+src=["']([^"']+)["']/is

async function fetchImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CatalogBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    })
    if (!res.ok) return null
    const html = await res.text()
    const m = OG_IMAGE_RE.exec(html) || OG_IMAGE_RE2.exec(html)
    if (m) return m[1]
    // fallback: first wp-content/uploads URL that looks like an image
    const wpMatch = /https:\/\/elegancevipperfume\.com\/wp-content\/uploads\/[^"'\s]+\.(jpg|jpeg|png|webp)/i.exec(html)
    if (wpMatch) return wpMatch[0]
    return null
  } catch (e) {
    return null
  }
}

// Process in batches of 5
const results = new Map()
const batchSize = 5
for (let i = 0; i < missing.length; i += batchSize) {
  const batch = missing.slice(i, i + batchSize)
  const fetched = await Promise.all(batch.map(p => fetchImage(p.web_url).then(img => ({ code: p.code, img }))))
  for (const { code, img } of fetched) {
    results.set(code, img)
    console.log(`  ${code}: ${img || 'NOT FOUND'}`)
  }
}

// Update catalog
let updated = 0
for (const p of goldCatalog) {
  if (!p.image_url && results.has(p.code)) {
    const img = results.get(p.code)
    if (img) { p.image_url = img; updated++ }
  }
}

writeFileSync('data/gold_catalog.json', JSON.stringify(goldCatalog, null, 2), 'utf8')
console.log(`\n✅ Updated ${updated} image URLs`)
console.log(`Still missing: ${goldCatalog.filter(p => !p.image_url).length}`)
