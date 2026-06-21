import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { product_code, product_name, product_series, lead_id, session_id, question, answer } = await req.json()

    if (!product_name) return NextResponse.json({ error: 'product_name required' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // Upsert: if session already has an event for this product, append question
    if (question && session_id) {
      const { data: existing } = await supabase
        .from('asya_unboxing_events')
        .select('id, questions')
        .eq('session_id', session_id)
        .eq('product_name', product_name)
        .maybeSingle()

      if (existing) {
        const questions = Array.isArray(existing.questions) ? existing.questions : []
        questions.push({ q: question, a: answer || '', ts: new Date().toISOString() })
        await supabase
          .from('asya_unboxing_events')
          .update({ questions })
          .eq('id', existing.id)
        return NextResponse.json({ ok: true, id: existing.id })
      }
    }

    // Insert new event
    const { data, error } = await supabase
      .from('asya_unboxing_events')
      .insert({
        product_code: product_code || null,
        product_name,
        product_series: product_series || null,
        lead_id: lead_id || null,
        session_id: session_id || null,
        questions: question ? [{ q: question, a: answer || '', ts: new Date().toISOString() }] : [],
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error('unboxing-event error:', err)
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 })
  }
}
