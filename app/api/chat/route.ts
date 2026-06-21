import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildAysaSystemPrompt, buildProductLookup } from '@/prompts/asya-system'
import { getProductLookup } from '@/lib/product-catalog'

// JSON file-based lookup (sync, loaded at module init)
const jsonLookup = buildProductLookup()

type LookupMap = Record<string, { img: string; url: string; woo_id?: number; series: string }>

/** Enrich a product — JSON first (fast), Supabase cache as fallback */
function enrich(product: Record<string, unknown>, dynamic: LookupMap = {}) {
  const code = (product.code as string || '').toLowerCase().trim()
  const name = (product.name as string || '').toLowerCase().trim()

  // JSON lookup first, then Supabase cached lookup
  let found = code ? (jsonLookup[code] ?? dynamic[code]) : undefined
  if (!found && name) found = jsonLookup[name] ?? dynamic[name]

  // woo_id direct key
  if (!found && product.woo_id) {
    found = jsonLookup[`woo_${product.woo_id}`] ?? dynamic[`woo_${product.woo_id}`]
  }

  // Fuzzy word match across both
  if (!found && name) {
    const words = name
      .split(/\s+/)
      .filter(w => w.length > 3 && !['extrait','parfum','edp','100','ml','niş','elegancia'].includes(w))
    if (words.length >= 1) {
      const combined = { ...dynamic, ...jsonLookup }
      const entry = Object.entries(combined).find(([k]) =>
        words.filter(w => k.includes(w)).length >= Math.min(2, words.length)
      )
      if (entry) found = entry[1]
    }
  }

  if (found) {
    product.image_url = found.img
    product.web_url   = found.url
    if (found.woo_id) product.woo_id = found.woo_id
    if (!product.series) product.series = found.series
  }
  return product
}

// Module-level singletons — created once, reused across requests
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'tr', mode = 'profil', userName = '' } = await req.json()

    // Keep last 8 messages — enough context, fewer tokens
    const trimmed = Array.isArray(messages) ? messages.slice(-8) : messages

    // System prompt is JSON-only (fast, no Supabase)
    const systemPrompt = buildAysaSystemPrompt(language, mode, userName)

    // Fire OpenAI + Supabase enrichment lookup IN PARALLEL
    // Supabase lookup is 1-hour cached → nearly instant after first hit
    // Total latency ≈ OpenAI time only (not sequential)
    const [response, dynamicLookup] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: systemPrompt },
          ...trimmed,
        ],
        response_format: { type: 'json_object' },
      }),
      getProductLookup().catch(() => ({} as Record<string, { img: string; url: string; woo_id?: number; series: string }>)),
    ])

    const raw = response.choices[0].message.content || '{}'
    let parsed: Record<string, unknown>

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { type: 'chat', output: raw }
    }

    // Enrich profile_ready top3 + oda_kokusu (JSON + Supabase cache)
    if (parsed.type === 'profile_ready' && parsed.profile) {
      const profile = parsed.profile as Record<string, unknown>

      // top3 parfüm enrichment
      const top3 = profile.top3 as Record<string, unknown>[] | undefined
      if (Array.isArray(top3)) top3.forEach(p => enrich(p, dynamicLookup))

      // oda_kokusu enrichment
      const ok = profile.oda_kokusu as Record<string, unknown> | undefined
      if (ok) {
        const wooKey = ok.woo_id ? `woo_${ok.woo_id}` : ''
        const found = (wooKey && (jsonLookup[wooKey] || dynamicLookup[wooKey]))
          || jsonLookup[(ok.name as string || '').toLowerCase()]
          || dynamicLookup[(ok.name as string || '').toLowerCase()]
        if (found) {
          ok.image_url = found.img
          ok.web_url   = found.url
        }
      }
    }

    // Enrich muadil_match product
    if (parsed.type === 'muadil_match' && parsed.product) {
      enrich(parsed.product as Record<string, unknown>, dynamicLookup)
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { type: 'chat', output: 'Bir sorun oluştu, lütfen tekrar deneyin 😊' },
      { status: 500 }
    )
  }
}
