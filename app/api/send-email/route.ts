import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, buildRecommendationEmail } from '@/lib/email'
import { saveRecommendation, logEmail } from '@/lib/supabase'

interface Top3Product {
  code?: string
  name: string
  series?: string
  image_url?: string
  web_url?: string
  woo_id?: number
  story?: string
  notes?: string
  top_notes?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const {
      name, email, lead_id, session_id,
      top3 = [],
      scent_profile,
      coupon,
      referral_url,
      language = 'tr',
    } = await req.json()

    const products = top3 as Top3Product[]
    const elegancia = products.find(p => p.series === 'elegancia')
    const golds = products.filter(p => p.series !== 'elegancia')

    // Save recommendation to Supabase
    saveRecommendation({
      lead_id,
      session_id,
      gold_code: golds[0]?.code,
      gold_name: golds[0]?.name,
      gold_url: golds[0]?.web_url,
      elegancia_code: elegancia?.code,
      elegancia_name: elegancia?.name,
      elegancia_url: elegancia?.web_url,
      scent_profile: scent_profile || {},
      language,
    }).catch(err => console.error('saveRecommendation error:', err))

    const subject = `${name}, ASYA koku profilinizi hazırladı ✨`

    const html = buildRecommendationEmail({
      name,
      top3: products,
      couponCode: coupon || undefined,
      couponDiscount: 10,
      scentStory: scent_profile?.subtitle || 'ASYA size en uygun kokuları seçti!',
      scentProfile: scent_profile,
      referralUrl: referral_url,
    })

    const ok = await sendEmail({ to: email, toName: name, subject, html })

    // Log to Supabase (body kaydediliyor → panelde önizleme çalışsın)
    logEmail({
      lead_id: lead_id || undefined,
      email_to: email,
      email_name: name,
      email_type: 'profile_ready',
      subject,
      status: ok ? 'sent' : 'failed',
      body: html,
      metadata: {
        products: products.map(p => p.name),
        coupon: coupon || null,
        has_referral: !!referral_url,
      },
    }).catch(e => console.error('logEmail error:', e))

    return NextResponse.json({ success: ok })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Email gönderilemedi' }, { status: 500 })
  }
}
