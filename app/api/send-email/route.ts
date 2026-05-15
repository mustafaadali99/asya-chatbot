import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, buildRecommendationEmail } from '@/lib/email'
import { createCoupon } from '@/lib/woocommerce'
import { saveRecommendation } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const {
      name, email, lead_id, session_id,
      gold_code, gold_name, gold_url, gold_woo_id, gold_image,
      elegancia_code, elegancia_name, elegancia_url,
      home_code, home_name, home_url,
      scent_profile, language = 'tr',
      scent_story,
    } = await req.json()

    // WooCommerce kupon oluştur
    let couponCode: string | undefined
    if (gold_woo_id && email) {
      const coupon = await createCoupon(email, gold_woo_id, 10)
      couponCode = coupon || undefined
    }

    // Supabase'e kaydet
    await saveRecommendation({
      lead_id, session_id,
      gold_code, gold_name, gold_url,
      elegancia_code, elegancia_name, elegancia_url,
      home_code, home_name, home_url,
      scent_profile: scent_profile || {},
      language,
    })

    // Email gönder
    const html = buildRecommendationEmail({
      name,
      productName: gold_name || elegancia_name || '',
      productUrl: gold_url || elegancia_url || '',
      productImage: gold_image || '',
      couponCode,
      couponDiscount: 10,
      scentStory: scent_story || `ASYA size en uygun kokuyu buldu!`,
    })

    await sendEmail({
      to: email,
      toName: name,
      subject: `${name}, ASYA sizin için seçti 🌸`,
      html,
    })

    return NextResponse.json({ success: true, coupon_code: couponCode })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Email gönderilemedi' }, { status: 500 })
  }
}
