import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildVisionPrompt, buildProductLookup } from '@/prompts/asya-system'

const lookup = buildProductLookup()

function enrich(product: Record<string, unknown>) {
  const code = (product.code as string || '').toLowerCase().trim()
  const name = (product.name as string || '').toLowerCase().trim()

  // 1. Exact code match
  let found = code ? lookup[code] : undefined

  // 2. Exact name match
  if (!found && name) found = lookup[name]

  // 3. Multi-word match: at least 2 significant words must appear in key
  if (!found && name) {
    const words = name.split(/\s+/).filter(w => w.length > 3 && !['extrait','parfum','edp','100','ml','niş','serisi','elegancia'].includes(w))
    if (words.length >= 1) {
      const entry = Object.entries(lookup).find(([k]) =>
        words.filter(w => k.includes(w)).length >= Math.min(2, words.length)
      )
      if (entry) found = entry[1]
    }
  }

  if (found) {
    product.image_url = found.img
    product.web_url = found.url
    if (found.woo_id) product.woo_id = found.woo_id
    if (!product.series) product.series = found.series
  }
  return product
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { imageDataUrl } = await req.json()
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
      return NextResponse.json({ type: 'vision_unknown', output: 'Geçersiz görsel formatı.' }, { status: 400 })
    }

    const systemPrompt = buildVisionPrompt()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Bu görseli incele ve koku eşleştirmesi yap.' },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0].message.content || '{}'
    let parsed: Record<string, unknown>
    try { parsed = JSON.parse(raw) } catch { parsed = { type: 'vision_unknown', output: raw } }

    if (parsed.product) enrich(parsed.product as Record<string, unknown>)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Vision error:', err)
    return NextResponse.json({ type: 'vision_unknown', output: 'Görsel analizi sırasında bir sorun oluştu, tekrar dene.' }, { status: 500 })
  }
}
