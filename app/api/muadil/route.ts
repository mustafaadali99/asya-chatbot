import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildMuadilPrompt, buildProductLookup } from '@/prompts/asya-system'

const lookup = buildProductLookup()

function enrich(product: Record<string, unknown>) {
  const code = (product.code as string || '').toLowerCase().trim()
  const name = (product.name as string || '').toLowerCase().trim()

  let found = code ? lookup[code] : undefined
  if (!found && name) found = lookup[name]
  if (!found && name) {
    const words = name.split(/\s+/).filter(w => w.length > 3 && !['extrait','parfum','edp','niş','serisi','elegancia'].includes(w))
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
    const { query } = await req.json()
    if (!query?.trim()) {
      return NextResponse.json({ type: 'muadil_unknown', output: 'Lütfen bir parfüm adı yazın.' }, { status: 400 })
    }

    const systemPrompt = buildMuadilPrompt()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Muadilini bulmak istediğim parfüm: "${query}"` },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0].message.content || '{}'
    let parsed: Record<string, unknown>
    try { parsed = JSON.parse(raw) } catch { parsed = { type: 'muadil_unknown', output: raw } }

    if (parsed.product) enrich(parsed.product as Record<string, unknown>)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Muadil error:', err)
    return NextResponse.json({ type: 'muadil_unknown', output: 'Bir sorun oluştu, tekrar dene.' }, { status: 500 })
  }
}
