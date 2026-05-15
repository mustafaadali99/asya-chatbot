const BREVO_KEY = process.env.BREVO_API_KEY!
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'info@elegancevipperfume.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ASYA - Elegance VIP Perfume'

interface SendEmailParams {
  to: string
  toName: string
  subject: string
  html: string
}

export async function sendEmail({ to, toName, subject, html }: SendEmailParams) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  })
  return res.ok
}

export function buildRecommendationEmail(params: {
  name: string
  productName: string
  productUrl: string
  productImage: string
  couponCode?: string
  couponDiscount?: number
  scentStory: string
}) {
  const { name, productName, productUrl, productImage, couponCode, couponDiscount, scentStory } = params
  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px;text-align:center;">
          <p style="color:#d4af37;font-size:12px;letter-spacing:3px;margin:0 0 8px;">ELEGANCE VIP PERFUME</p>
          <h1 style="color:#fff;font-size:22px;margin:0;font-weight:400;">ASYA Koku Asistanınız</h1>
          <p style="color:#d4af37;font-size:11px;margin:8px 0 0;letter-spacing:2px;">sizin için seçti 🌸</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 40px 0;">
          <p style="color:#333;font-size:16px;margin:0;">Merhaba <strong>${name}</strong>,</p>
          <p style="color:#666;font-size:15px;line-height:1.7;margin:16px 0 0;">${scentStory}</p>
        </td></tr>

        <!-- Product -->
        <tr><td style="padding:24px 40px;">
          <table width="100%" style="background:#faf8f5;border-radius:12px;overflow:hidden;">
            <tr>
              <td width="140" style="padding:20px;">
                <img src="${productImage}" width="120" style="border-radius:8px;display:block;" alt="${productName}">
              </td>
              <td style="padding:20px 20px 20px 0;">
                <p style="color:#888;font-size:11px;letter-spacing:2px;margin:0 0 6px;">SİZİN İÇİN SEÇİLDİ</p>
                <h2 style="color:#1a1a2e;font-size:17px;margin:0 0 16px;font-weight:600;">${productName}</h2>
                <a href="${productUrl}" style="background:#1a1a2e;color:#d4af37;text-decoration:none;padding:10px 24px;border-radius:24px;font-size:13px;letter-spacing:1px;display:inline-block;">
                  İncele & Satın Al ✨
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        ${couponCode ? `
        <!-- Coupon -->
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" style="background:linear-gradient(135deg,#d4af37,#f0d060);border-radius:12px;padding:20px;">
            <tr><td style="text-align:center;">
              <p style="color:#1a1a2e;font-size:12px;letter-spacing:2px;margin:0 0 8px;">SIZE ÖZEL İNDİRİM</p>
              <p style="color:#1a1a2e;font-size:28px;font-weight:700;letter-spacing:4px;margin:0;">${couponCode}</p>
              <p style="color:#1a1a2e;font-size:13px;margin:8px 0 0;">%${couponDiscount} indirim • 3 gün geçerli • Tek kullanım</p>
            </td></tr>
          </table>
        </td></tr>
        ` : ''}

        <!-- Footer -->
        <tr><td style="background:#1a1a2e;padding:24px;text-align:center;">
          <p style="color:#d4af37;font-size:11px;letter-spacing:2px;margin:0 0 8px;">ELEGANCE VIP PERFUME</p>
          <p style="color:#888;font-size:12px;margin:0;">
            <a href="https://www.elegancevipperfume.com" style="color:#d4af37;text-decoration:none;">www.elegancevipperfume.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function buildFollowupEmail(params: {
  name: string
  productName: string
  productUrl: string
  day: 3 | 7
  couponCode?: string
}) {
  const { name, productName, productUrl, day, couponCode } = params
  const subject = day === 3
    ? `${name}, kokunuz sizi bekliyor 🌸`
    : `Son hatırlatma — ${productName} için özel teklifiniz`

  const html = `
<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:40px 20px;background:#faf8f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#1a1a2e;padding:24px;text-align:center;">
          <p style="color:#d4af37;font-size:11px;letter-spacing:3px;margin:0;">ELEGANCE VIP PERFUME</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#333;font-size:16px;">Merhaba <strong>${name}</strong>,</p>
          <p style="color:#666;font-size:15px;line-height:1.7;">
            ${day === 3
              ? `ASYA'nın size önerdiği <strong>${productName}</strong> hâlâ sizi bekliyor. Bazen en doğru koku, ilk düşündüğümüzdür 😊`
              : `<strong>${productName}</strong> için son fırsatınız! Size özel teklifiniz yarın sona eriyor.`
            }
          </p>
          ${couponCode ? `<p style="color:#666;font-size:14px;">Kupon kodunuz: <strong style="color:#d4af37;font-size:18px;">${couponCode}</strong></p>` : ''}
          <a href="${productUrl}" style="background:#1a1a2e;color:#d4af37;text-decoration:none;padding:12px 32px;border-radius:24px;font-size:14px;display:inline-block;margin-top:16px;">
            Hemen İncele ✨
          </a>
        </td></tr>
        <tr><td style="background:#1a1a2e;padding:16px;text-align:center;">
          <a href="https://www.elegancevipperfume.com" style="color:#d4af37;font-size:12px;text-decoration:none;">www.elegancevipperfume.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}
