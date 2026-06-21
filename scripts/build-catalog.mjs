/**
 * build-catalog.mjs
 * Parses filled CSV → cleans notes → merges image_url from existing JSONs → outputs updated catalog files
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── Load existing JSONs (for image_url) ─────────────────────────────────────
const existingGold = JSON.parse(readFileSync(join(ROOT, 'data/gold_catalog.json'), 'utf8'))
const existingElegancia = JSON.parse(readFileSync(join(ROOT, 'data/elegancia_catalog.json'), 'utf8'))

/** Map woo_id → image_url from existing data */
const imageByWooId = new Map()
const imageByCode = new Map()
for (const p of [...existingGold, ...existingElegancia]) {
  if (p.image_url) {
    if (p.woo_id) imageByWooId.set(String(p.woo_id), p.image_url)
    if (p.code)   imageByCode.set(p.code, p.image_url)
  }
}

// ─── CSV parser (handles quoted fields with commas inside) ───────────────────
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim() })
    return obj
  })
}

// ─── Note cleaning ───────────────────────────────────────────────────────────
/**
 * Cleans a note field:
 * - If it's a sentence (>50 chars, no commas dominating), extract note names from it
 * - If it has "English (Turkish) ➡️ ..." format, extract only Turkish
 * - If it has "• Note: ..." bullet format, extract note names
 * - Otherwise split by comma and clean
 */
function cleanNotes(raw) {
  if (!raw || !raw.trim()) return []
  let s = raw.trim()

  // Remove leading colon+space (K-147 style ": Note, note")
  s = s.replace(/^:\s*/, '')

  // EL-002 style: "• Top Notes (...): ▸ X • Heart Notes...: ▸ Y" - complex multiline/inline
  // We handle EL-002 as a special case below; for others strip markdown bullets
  s = s.replace(/[▸•]/g, ',')

  // "English (Turkish) ➡️ description" → extract Turkish from parentheses if present,
  // or just take the part before ➡️
  if (s.includes('➡️')) {
    s = s.split('➡️')[0].trim()
  }

  // Extract text in parentheses (Turkish translations): "Bergamot (Bergamot)" → "Bergamot"
  // Strategy: if pattern "Word (TurkishWord)" exists, prefer the Turkish (in parens)
  s = s.replace(/\w[\w\s]*\(([^)]+)\)/g, (_, turkish) => turkish)

  // If the string is a long sentence (>60 chars), extract words likely to be ingredient names
  // Simple heuristic: split by "ve|ile|,|;" and take short-ish tokens
  if (s.length > 60 && !s.includes(',')) {
    // It's a sentence - split on "ve", "ile", punctuation
    const parts = s.split(/\s+(ve|ile)\s+|[;.]/i)
    s = parts.join(', ')
  }

  // Split by comma
  const parts = s.split(/,|;/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && p.length < 60) // discard very long fragments
    .map(p => {
      // Capitalize first letter
      return p.charAt(0).toUpperCase() + p.slice(1)
    })

  return parts
}

// Special manual overrides for problematic entries
const MANUAL_NOTES = {
  'EL-002': {
    top_notes: ['Vanilya Özütü', 'Lavanta'],
    heart_notes: ['Vanilya Tanesi', 'Yasemin'],
    base_notes: ['Vanilya Absolüsü', 'Sandal Ağacı', 'Misk'],
    scent_family: 'gourmand'
  },
  'K-011': {
    top_notes: ['Bergamot', 'Portakal Çiçeği'],
    heart_notes: ['Tuberoz', 'Yasemin'],
    base_notes: ['Sedir Ağacı', 'Beyaz Misk', 'Vanilya']
  },
  'K-013': {
    top_notes: ['Ananas', 'Şeftali', 'Bergamot', 'Mandalina'],
    heart_notes: ['Yasemin', 'İris', 'Heliotrop', 'Menekşe'],
    base_notes: ['Vanilya', 'Sedir Ağacı', 'Sandal Ağacı', 'Misk']
  },
  'K-020': {
    top_notes: ['Siyah Frenk Üzümü'],
    heart_notes: ['Frezya', 'Gül'],
    base_notes: ['Vanilya', 'Paçuli', 'Amber', 'Odunsu Notalar']
  },
  'K-072': {
    scent_family: 'floral'  // Lady Million is floral, not woody
  },
  'K-147': {
    top_notes: ['Mor Tutku Meyvesi', 'Shangri-la Şakayık'],
    heart_notes: ['Yasemin', 'Manolya', 'Vanilya Orkide'],
    base_notes: ['Misk', 'Sandal Ağacı']
  },
  'EL-007': {
    top_notes: ['Mineral', 'Sıcak Baharat'],
    heart_notes: ['Deri', 'Odunsu'],
    base_notes: ['Öd Ağacı', 'Misk', 'Çiçeksi']
  },
  'EL-008': {
    top_notes: ['Sıcak Baharatlar'],
    heart_notes: ['Tarçın', 'Tonka Fasulyesi', 'Meşe'],
    base_notes: ['Pralin', 'Vanilya', 'Sandal Ağacı']
  }
}

// ─── Parse CSV ───────────────────────────────────────────────────────────────
const csvText = readFileSync('C:/Users/Pc/Documents/New project/asya_katalog_doldurulmus_2026-05-16.csv', 'utf8')
const rows = parseCSV(csvText)

// ─── Map existing JSON entries by code and woo_id for name/image lookup ──────
const existingByCode = new Map()
const existingByWooId = new Map()
for (const p of [...existingGold, ...existingElegancia]) {
  if (p.code) existingByCode.set(p.code, p)
  if (p.woo_id) existingByWooId.set(String(p.woo_id), p)
}

// ─── Build output entries ─────────────────────────────────────────────────────
const goldOut = []
const eleganciaOut = []

for (const row of rows) {
  const code = row.code || ''
  const wooId = parseInt(row.woo_id) || 0
  const series = row.series || 'gold'
  const inStock = row.in_stock === 'true'

  // Get image_url from existing JSON (priority: by code, then by woo_id)
  const imageUrl = imageByCode.get(code) || imageByWooId.get(row.woo_id) || ''

  // Get existing entry for long product name
  const existing = existingByCode.get(code) || existingByWooId.get(row.woo_id)
  // Use existing long name if available, otherwise display_name from CSV
  const name = existing?.name || row.display_name || ''

  // Apply manual override or clean CSV notes
  const override = MANUAL_NOTES[code] || {}

  let topNotes = override.top_notes || cleanNotes(row.top_notes)
  let heartNotes = override.heart_notes || cleanNotes(row.heart_notes)
  let baseNotes = override.base_notes || cleanNotes(row.base_notes)
  let scentFamily = override.scent_family || row.scent_family || 'fresh'

  // Clean gender: normalize unisex in gold to either kadin/erkek based on display_name,
  // or keep as unisex (the system prompt will handle it)
  const gender = row.gender || 'unisex'

  const entry = {
    woo_id: wooId,
    code,
    name,
    series,
    gender,
    image_url: imageUrl,
    web_url: row.web_url || existing?.web_url || '',
    in_stock: inStock,
    scent_family: scentFamily,
    top_notes: topNotes,
    heart_notes: heartNotes,
    base_notes: baseNotes,
    muadil: row.muadil_orijinal || ''
  }

  if (series === 'elegancia') {
    eleganciaOut.push(entry)
  } else {
    // gold, creasyon, luxury all go to gold_catalog
    goldOut.push(entry)
  }
}

// ─── Write output files ───────────────────────────────────────────────────────
writeFileSync(join(ROOT, 'data/gold_catalog.json'), JSON.stringify(goldOut, null, 2), 'utf8')
writeFileSync(join(ROOT, 'data/elegancia_catalog.json'), JSON.stringify(eleganciaOut, null, 2), 'utf8')

// ─── Stats ────────────────────────────────────────────────────────────────────
const byGender = {}
for (const p of goldOut) {
  byGender[p.gender] = (byGender[p.gender] || 0) + 1
}

console.log('✅ Catalogs updated')
console.log(`Gold catalog: ${goldOut.length} products`)
console.log(`  Gender breakdown:`, byGender)
console.log(`  In stock: ${goldOut.filter(p => p.in_stock).length}`)
console.log(`  With notes: ${goldOut.filter(p => p.top_notes.length > 0).length}`)
console.log(`  Missing image_url: ${goldOut.filter(p => !p.image_url).length}`)
console.log(`Elegancia catalog: ${eleganciaOut.length} products`)
console.log(`  In stock: ${eleganciaOut.filter(p => p.in_stock).length}`)
console.log(`  With notes: ${eleganciaOut.filter(p => p.top_notes.length > 0).length}`)

// Spot check
const k072 = goldOut.find(p => p.code === 'K-072')
const el002 = eleganciaOut.find(p => p.code === 'EL-002')
const k147 = goldOut.find(p => p.code === 'K-147')
console.log('\n🔍 Spot checks:')
console.log('K-072 scent_family:', k072?.scent_family, '| top_notes:', k072?.top_notes)
console.log('EL-002 top_notes:', el002?.top_notes)
console.log('K-147 top_notes:', k147?.top_notes, '| heart:', k147?.heart_notes, '| base:', k147?.base_notes)
