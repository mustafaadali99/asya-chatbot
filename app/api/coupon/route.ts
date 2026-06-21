import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { MAIN_API } from '@/lib/email'

// Kupon artık ANA SİTENİN coupons tablosunda oluşturulur (WordPress YOK) → yeni sitede geçerli/kullanılabilir.
async function createSiteCoupon(email: string, discount = 10): Promise<string | null> {
  try {
    const r = await fetch(`${MAIN_API}/api/asya/coupon`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.ASYA_BRIDGE_SECRET ? { 'x-asya-secret': process.env.ASYA_BRIDGE_SECRET } : {}) },
      body: JSON.stringify({ email, discount, days: 30, source: 'asya' }),
    })
    const j = await r.json().catch(() => ({}))
    return j.coupon || null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const { lead_id } = await req.json()

    // lead_id zorunlu ve UUID formatında olmalı
    if (!lead_id || typeof lead_id !== 'string' || lead_id.length < 20) {
      return NextResponse.json({ coupon: null }, { status: 400 })
    }

    // Lead'in gerçekten var olduğunu doğrula
    const { data: lead, error: leadErr } = await getSupabaseAdmin()
      .from('asya_leads')
      .select('id, email, metadata')
      .eq('id', lead_id)
      .single()

    if (leadErr || !lead?.email) {
      return NextResponse.json({ coupon: null }, { status: 404 })
    }

    // Bu lead için daha önce kupon oluşturulduysa aynısını döndür (tekrar üretme)
    const existingCoupon = (lead.metadata as Record<string, string> | null)?.coupon_code
    if (existingCoupon) {
      return NextResponse.json({ coupon: existingCoupon })
    }

    // Yeni kupon oluştur (ana sitede)
    const code = await createSiteCoupon(lead.email, 10)
    if (!code) return NextResponse.json({ coupon: null })

    // Kuponu lead metadata'sına kaydet (idempotent)
    await getSupabaseAdmin()
      .from('asya_leads')
      .update({ metadata: { ...(lead.metadata as object || {}), coupon_code: code } })
      .eq('id', lead_id)

    return NextResponse.json({ coupon: code })
  } catch (err) {
    console.error('Coupon error:', err)
    return NextResponse.json({ coupon: null })
  }
}
