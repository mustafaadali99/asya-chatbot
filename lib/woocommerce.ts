const WC_URL = process.env.WC_SITE_URL!
const WC_CK = process.env.WC_CONSUMER_KEY!
const WC_CS = process.env.WC_CONSUMER_SECRET!

function wcAuth() {
  return `consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
}

export async function checkStock(wooId: number): Promise<boolean> {
  try {
    const res = await fetch(`${WC_URL}/wp-json/wc/v3/products/${wooId}?${wcAuth()}`)
    const product = await res.json()
    return product.stock_status === 'instock'
  } catch {
    return true
  }
}

export async function createReferralCoupon(
  email: string,
  name: string,
  role: 'invitee' | 'referrer'
): Promise<string | null> {
  try {
    const slug = name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8)
    const suffix = Date.now().toString(36).toUpperCase().slice(-4)
    const code = `${slug || 'ASYA'}-${suffix}`
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 14)

    const body = {
      code,
      discount_type: 'percent',
      amount: '50',
      individual_use: true,
      usage_limit: 1,
      usage_limit_per_user: 1,
      limit_usage_to_x_items: 1,
      email_restrictions: [email],
      date_expires: expiry.toISOString().split('T')[0],
      description: `ASYA Davet · ${role === 'invitee' ? 'Davetli' : 'Davet Eden'}: ${name} (${email})`,
    }

    const res = await fetch(`${WC_URL}/wp-json/wc/v3/coupons?${wcAuth()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const coupon = await res.json()
    return coupon.code || null
  } catch {
    return null
  }
}

export async function createCoupon(
  email: string,
  productId: number | undefined,
  discountPercent = 10
): Promise<string | null> {
  try {
    const code = `ASYA-${Date.now().toString(36).toUpperCase()}`
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 3)

    const body = {
      code,
      discount_type: 'percent',
      amount: String(discountPercent),
      individual_use: true,
      usage_limit: 1,
      usage_limit_per_user: 1,
      email_restrictions: [email],
      product_ids: productId ? [productId] : [],
      date_expires: expiry.toISOString().split('T')[0],
      description: `ASYA Koku Asistanı - ${email}`,
    }

    const res = await fetch(`${WC_URL}/wp-json/wc/v3/coupons?${wcAuth()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const coupon = await res.json()
    return coupon.code || null
  } catch {
    return null
  }
}
