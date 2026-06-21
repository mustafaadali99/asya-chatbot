import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

function generateRefCode(name: string): string {
  const namePart = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z]/g, '')
    .slice(0, 6)
  const random = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `${namePart || 'ASYA'}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const { lead_id, name, email } = await req.json()
    if (!lead_id || !name || !email) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
    }

    // Reuse existing pending referral if present
    const { data: existing } = await getSupabaseAdmin()
      .from('asya_referrals')
      .select('ref_code')
      .eq('referrer_lead_id', lead_id)
      .eq('status', 'pending')
      .maybeSingle()

    const ref_code = existing?.ref_code ?? generateRefCode(name)

    if (!existing) {
      await getSupabaseAdmin()
        .from('asya_referrals')
        .insert({ ref_code, referrer_lead_id: lead_id, referrer_name: name, referrer_email: email })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asya.elegancevipperfume.com'
    return NextResponse.json({ ref_code, url: `${baseUrl}/chat?ref=${ref_code}` })
  } catch (err) {
    console.error('Referral create error:', err)
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 })
  }
}
