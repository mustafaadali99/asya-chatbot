import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { lead_id, occasions } = await req.json()
    if (!lead_id || !Array.isArray(occasions)) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    const rows = occasions.map((o: { occasion_name: string; occasion_date: string; recipient_name?: string; product_name?: string; product_url?: string }) => ({
      lead_id,
      occasion_name: o.occasion_name,
      occasion_date: o.occasion_date,
      recipient_name: o.recipient_name || null,
      product_name: o.product_name || null,
      product_url: o.product_url || null,
    }))

    const { error } = await getSupabaseAdmin()
      .from('asya_gift_reminders')
      .insert(rows)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('gift-occasions error:', err)
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 })
  }
}
