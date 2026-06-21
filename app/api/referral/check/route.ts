import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { lead_id } = await req.json()
    if (!lead_id) return NextResponse.json({ coupon: null })

    const { data } = await getSupabaseAdmin()
      .from('asya_leads')
      .select('referrer_coupon')
      .eq('id', lead_id)
      .single()

    const coupon = data?.referrer_coupon || null

    // If coupon found, clear it from DB (shown once, then gone)
    if (coupon) {
      await getSupabaseAdmin()
        .from('asya_leads')
        .update({ referrer_coupon: null })
        .eq('id', lead_id)
    }

    return NextResponse.json({ coupon, has_coupon: !!coupon })
  } catch {
    return NextResponse.json({ coupon: null, has_coupon: false })
  }
}
