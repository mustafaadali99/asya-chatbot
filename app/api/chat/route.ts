import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildAysaSystemPrompt } from '@/prompts/asya-system'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'tr' } = await req.json()

    const systemPrompt = buildAysaSystemPrompt(language)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0].message.content || '{}'
    let parsed: Record<string, unknown>

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { type: 'chat', output: raw }
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
