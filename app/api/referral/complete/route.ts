import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, logEmail } from '@/lib/supabase'
import { sendEmail, buildReferrerCouponEmail, MAIN_API } from '@/lib/email'

// Referral kuponları da ANA SİTEDE oluşturulur (WordPress YOK)
async function mkSiteCoupon(email: string, discount: number): Promise<string | null> {
  try {
    const r = await fetch(`${MAIN_API}/api/asya/coupon`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.ASYA_BRIDGE_SECRET ? { 'x-asya-secret': process.env.ASYA_BRIDGE_SECRET } : {}) },
      body: JSON.stringify({ email, discount, days: 30, source: 'asya_referral' }),
    })
    const j = await r.json().catch(() => ({})); return j.coupon || null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const { ref_code, invitee_lead_id, invitee_name, invitee_email } = await req.json()

    if (!ref_code || !invitee_lead_id || !invitee_name || !invitee_email) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
    }

    const { data: referral } = await getSupabaseAdmin()
      .from('asya_referrals')
      .select('*')
      .eq('ref_code', ref_code)
      .eq('status', 'pending')
      .maybeSingle()

    if (!referral) {
      return NextResponse.json({ error: 'Geçersiz veya kullanılmış davet kodu' }, { status: 404 })
    }

    if (referral.referrer_lead_id === invitee_lead_id) {
      return NextResponse.json({ error: 'Kendi kendinizi davet edemezsiniz' }, { status: 400 })
    }

    const [inviteeCoupon, referrerCoupon] = await Promise.all([
      mkSiteCoupon(invitee_email, 10),
      mkSiteCoupon(referral.referrer_email, 15),
    ])

    await getSupabaseAdmin()
      .from('asya_referrals')
      .update({
        invitee_lead_id,
        invitee_name,
        invitee_email,
        invitee_coupon: inviteeCoupon,
        referrer_coupon: referrerCoupon,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('ref_code', ref_code)

    if (referrerCoupon) {
      await getSupabaseAdmin()
        .from('asya_leads')
        .update({ referrer_coupon: referrerCoupon })
        .eq('id', referral.referrer_lead_id)
    }

    // Email to referrer (fire-and-forget) + log
    if (referral.referrer_email && referrerCoupon) {
      const subject = `🎉 ${invitee_name} koku testini tamamladı — indirim kodunuz hazır!`
      const html = buildReferrerCouponEmail(referral.referrer_name, invitee_name, referrerCoupon)

      sendEmail({
        to: referral.referrer_email,
        toName: referral.referrer_name,
        subject,
        html,
      }).then(ok => {
        logEmail({
          lead_id: referral.referrer_lead_id || undefined,
          email_to: referral.referrer_email,
          email_name: referral.referrer_name,
          email_type: 'referral_coupon',
          subject,
          status: ok ? 'sent' : 'failed',
          metadata: { coupon: referrerCoupon, invitee_name, ref_code },
        }).catch(e => console.error('logEmail error:', e))
      }).catch(e => console.error('Referrer email error:', e))
    }

    return NextResponse.json({ invitee_coupon: inviteeCoupon, success: true })
  } catch (err) {
    console.error('Referral complete error:', err)
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 })
  }
}
