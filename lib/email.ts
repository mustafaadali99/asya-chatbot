const BREVO_KEY = process.env.BREVO_API_KEY!
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'info@elegancevipperfume.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ASYA | Elegance PARFUM'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asya.elegancevipperfume.com'
const SHOP_URL = 'https://www.elegancevipperfume.com'

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
  if (!res.ok) {
    const errBody = await res.text().catch(() => '(unreadable)')
    console.error(`[sendEmail] Brevo error ${res.status}: ${errBody}`)
  }
  return res.ok
}

interface Top3Product {
  name: string
  image_url?: string
  web_url?: string
  story?: string
  series?: string
  notes?: string
  top_notes?: string[]
}

interface ScentProfile {
  title?: string
  subtitle?: string
  fal_hikaye?: string
}

export function buildRecommendationEmail(params: {
  name: string
  top3: Top3Product[]
  couponCode?: string
  couponDiscount?: number
  scentStory: string
  scentProfile?: ScentProfile
  referralUrl?: string
}) {
  const { name, top3, couponCode, couponDiscount = 10, scentStory, scentProfile, referralUrl } = params
  const firstName = name.split(' ')[0]

  const productRows = top3.map((p, i) => {
    const isElegancia = p.series === 'elegancia'
    const badge = isElegancia ? '✦ ELEGANCİA PREMİUM · Extrait de Parfum' : `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} GOLD SERİSİ`
    const badgeColor = isElegancia ? '#5B4A82' : '#8A7FAA'
    const cardBg = isElegancia ? '#F4F0FB' : '#FAF8F5'
    const topNotesHtml = p.top_notes?.length
      ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:5px;">${p.top_notes.slice(0, 3).map(n => `<span style="padding:3px 10px;border-radius:999px;background:rgba(185,165,232,.18);font-size:11px;color:#5B4A82;font-family:Arial,sans-serif;">${n}</span>`).join('')}</div>`
      : ''
    return `
    <tr><td style="padding:${i === 0 ? '20px 32px 8px' : '8px 32px'};">
      <table width="100%" style="background:${cardBg};border-radius:16px;overflow:hidden;${isElegancia ? 'border:1px solid rgba(91,74,130,.22);' : 'border:1px solid rgba(185,165,232,.15);'}">
        <tr>
          <td width="100" style="padding:14px;">
            ${p.image_url
              ? `<img src="${p.image_url}" width="80" height="80" style="border-radius:10px;display:block;object-fit:cover;" alt="${p.name}">`
              : `<div style="width:80px;height:80px;border-radius:10px;background:linear-gradient(135deg,#E2D6F1,#FFF);display:flex;align-items:center;justify-content:center;"></div>`}
          </td>
          <td style="padding:14px 14px 14px 0;vertical-align:top;">
            <p style="color:${badgeColor};font-size:9px;letter-spacing:2px;margin:0 0 5px;font-weight:700;text-transform:uppercase;font-family:Arial,sans-serif;">${badge}</p>
            <h3 style="color:#2B2640;font-size:15px;margin:0 0 5px;font-weight:600;line-height:1.2;font-family:Georgia,serif;">${p.name}</h3>
            ${p.story ? `<p style="color:#5E5878;font-size:12px;line-height:1.5;margin:0 0 6px;font-style:italic;font-family:Georgia,serif;">${p.story}</p>` : ''}
            ${topNotesHtml}
            <a href="${p.web_url || SHOP_URL}" style="display:inline-block;margin-top:10px;background:${isElegancia ? 'linear-gradient(135deg,#5B4A82,#8B6FB5)' : '#2B2640'};color:#fff;text-decoration:none;padding:7px 16px;border-radius:20px;font-size:11px;letter-spacing:0.5px;font-family:Arial,sans-serif;font-weight:600;">
              İncele & Satın Al →
            </a>
          </td>
        </tr>
      </table>
    </td></tr>`
  }).join('')

  const falStory = scentProfile?.fal_hikaye || scentStory

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ASYA Koku Profiliniz</title>
</head>
<body style="margin:0;padding:0;background:#EDEAF5;font-family:'Georgia',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EDEAF5;padding:36px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 16px 48px rgba(43,38,64,0.16);max-width:580px;width:100%;">

  <!-- LOGO STRIP (beyaz arka plan, renkli logo) -->
  <tr><td style="background:#FFFFFF;padding:28px 36px 22px;text-align:center;border-bottom:1px solid rgba(185,165,232,0.15);">
    <img src="${SITE_URL}/elegance%20logo.png" alt="Elegance VIP Perfume" width="240" style="display:block;margin:0 auto;" />
  </td></tr>

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(145deg,#2B2640 0%,#3E3060 50%,#5B4A82 100%);padding:36px 36px 36px;text-align:center;">
    <p style="color:rgba(210,195,240,0.85);font-size:10px;letter-spacing:4px;margin:0 0 14px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600;">Yapay Zeka Destekli Koku Asistanı</p>
    <h1 style="color:#FFFFFF;font-size:30px;margin:0 0 10px;font-weight:400;letter-spacing:-0.5px;line-height:1.2;">Koku Profiliniz Hazır, <em style="font-style:italic;">${firstName}</em> ✨</h1>
    <p style="color:rgba(225,215,248,0.90);font-size:14px;margin:0;font-family:Arial,sans-serif;line-height:1.6;">ASYA size özel 3 koku seçti ve koku hikayenizi yazdı</p>
  </td></tr>

  ${scentProfile?.title ? `
  <!-- KOKU PROFİLİ KARTI -->
  <tr><td style="padding:28px 32px 0;">
    <table width="100%" style="background:linear-gradient(135deg,#F2EDFC,#EDF2FC);border-radius:18px;border:1px solid rgba(185,165,232,.35);">
      <tr><td style="padding:24px;">
        <p style="color:#7B6FA0;font-size:9px;letter-spacing:3px;margin:0 0 10px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700;">✦ Koku Profiliniz</p>
        <h2 style="color:#2B2640;font-size:24px;margin:0 0 10px;font-weight:500;font-family:Georgia,serif;">${scentProfile.title}</h2>
        ${scentProfile.subtitle ? `<p style="color:#4E4870;font-size:14px;line-height:1.65;margin:0;font-style:italic;font-family:Georgia,serif;">${scentProfile.subtitle}</p>` : ''}
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- KOKU HİKAYESİ -->
  <tr><td style="padding:24px 32px 16px;">
    <p style="color:#7B6FA0;font-size:9px;letter-spacing:3px;margin:0 0 12px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700;">✦ Koku Hikayeniz</p>
    <p style="color:#3D3560;font-size:15px;line-height:1.80;margin:0;font-style:italic;font-family:Georgia,serif;">${falStory}</p>
  </td></tr>

  <!-- ÜRÜN BAŞLIĞI -->
  <tr><td style="padding:8px 32px 4px;">
    <p style="color:#7B6FA0;font-size:9px;letter-spacing:3px;margin:0;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700;">ASYA'nın Size Özel Seçimleri</p>
  </td></tr>

  <!-- ÜRÜNLER -->
  ${productRows}

  ${couponCode ? `
  <!-- KUPON -->
  <tr><td style="padding:20px 32px 8px;">
    <table width="100%" style="border-radius:18px;overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#2B2640,#5B4A82);padding:28px;text-align:center;">
        <p style="color:rgba(210,195,240,0.85);font-size:10px;letter-spacing:3px;margin:0 0 12px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600;">Size Özel İndirim Kodu</p>
        <p style="color:#FFFFFF;font-size:30px;font-weight:700;letter-spacing:6px;margin:0 0 10px;font-family:'Courier New',monospace;">${couponCode}</p>
        <p style="color:rgba(220,210,248,0.85);font-size:13px;margin:0;font-family:Arial,sans-serif;">%${couponDiscount} indirim &nbsp;·&nbsp; 3 gün geçerli &nbsp;·&nbsp; Tek kullanım</p>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  ${referralUrl ? `
  <!-- ARKADAŞINLA PAYLAŞ -->
  <tr><td style="padding:16px 32px 8px;">
    <table width="100%" style="background:#FFFBF0;border-radius:16px;border:2px solid rgba(245,158,11,.20);">
      <tr><td style="padding:24px;text-align:center;">
        <p style="color:#92650A;font-size:10px;letter-spacing:3px;margin:0 0 10px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700;">🎁 Arkadaşını Davet Et</p>
        <p style="color:#4A3F2F;font-size:14px;line-height:1.65;margin:0 0 18px;font-family:Arial,sans-serif;">Arkadaşın ASYA ile koku testini tamamlarsa<br/><strong style="color:#92650A;">ikiniz de %50 indirim</strong> kazanırsınız!</p>
        <a href="${SITE_URL}/paylas?url=${encodeURIComponent(referralUrl)}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#FFF;text-decoration:none;padding:13px 30px;border-radius:999px;font-size:14px;font-family:Arial,sans-serif;font-weight:700;">
          Davet Linkini Paylaş →
        </a>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- ANA CTA -->
  <tr><td style="padding:24px 32px 36px;text-align:center;">
    <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#5B4A82,#8B6FB5);color:#fff;text-decoration:none;padding:16px 44px;border-radius:999px;font-size:15px;font-family:Arial,sans-serif;letter-spacing:0.5px;font-weight:600;box-shadow:0 10px 24px rgba(91,74,130,.35);">
      ASYA ile Sohbete Devam Et →
    </a>
    <p style="color:#9B8EAD;font-size:12px;margin:14px 0 0;font-family:Arial,sans-serif;">veya</p>
    <a href="${SHOP_URL}" style="color:#7B6FA0;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;font-weight:500;">Tüm koleksiyonu incele →</a>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#2B2640;padding:28px 36px;text-align:center;">
    <img src="${SITE_URL}/elegance-logo-white.png" alt="Elegance VIP" width="180" style="display:block;margin:0 auto 16px;" />
    <p style="color:rgba(210,195,240,0.80);font-size:11px;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600;">Elegance VIP Perfume</p>
    <a href="${SHOP_URL}" style="color:rgba(185,165,232,0.75);font-size:12px;text-decoration:none;font-family:Arial,sans-serif;">${SHOP_URL.replace('https://', '')}</a>
    <p style="color:rgba(210,200,235,0.55);font-size:11px;margin:16px 0 0;font-family:Arial,sans-serif;line-height:1.6;">Bu e-postayı ASYA üzerinden koku testi yaptığınız için aldınız.<br/>Türkiye'nin ilk yapay zeka destekli parfüm platformu.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function buildReferrerCouponEmail(referrerName: string, inviteeName: string, coupon: string) {
  const firstName = referrerName.split(' ')[0]
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F0EDF8;font-family:'Georgia',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDF8;padding:36px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(43,38,64,0.14);max-width:540px;width:100%;">
  <tr><td style="background:linear-gradient(145deg,#1C1630 0%,#3A2960 55%,#5B4A82 100%);padding:36px 32px;text-align:center;">
    <img src="${SITE_URL}/elegance-logo-white.png" alt="Elegance VIP" width="180" style="display:block;margin:0 auto 18px;" />
    <h1 style="color:#FFF;font-size:26px;margin:0 0 8px;font-weight:400;font-family:Georgia,serif;">Tebrikler, <em>${firstName}!</em> 🎉</h1>
    <p style="color:rgba(220,210,240,.80);font-size:14px;margin:0;font-family:Arial,sans-serif;">Davet ettiğin kişi koku testini tamamladı</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="color:#2B2640;font-size:15px;line-height:1.7;margin:0 0 20px;font-family:Arial,sans-serif;">
      Merhaba <strong>${firstName}</strong>, davet ettiğin <strong>${inviteeName}</strong> ASYA ile koku testini tamamladı. Vaat ettiğimiz gibi — kazanımın hazır! ✨
    </p>
    <table width="100%" style="border-radius:18px;overflow:hidden;margin-bottom:20px;">
      <tr><td style="background:linear-gradient(135deg,#5B4A82,#8B6FB5);padding:28px;text-align:center;">
        <p style="color:rgba(255,255,255,.65);font-size:9px;letter-spacing:3px;margin:0 0 12px;text-transform:uppercase;font-family:Arial,sans-serif;">İndirim Kodun</p>
        <p style="color:#FFFFFF;font-size:32px;font-weight:700;letter-spacing:8px;margin:0 0 10px;font-family:'Courier New',monospace;">${coupon}</p>
        <p style="color:rgba(220,210,240,.70);font-size:12px;margin:0;font-family:Arial,sans-serif;">2. ürününde %50 indirim · 14 gün geçerli · Tek kullanım</p>
      </td></tr>
    </table>
    <a href="${SHOP_URL}/shop" style="display:block;background:linear-gradient(135deg,#B9A5E8,#9FB4E0);color:#FFF;text-decoration:none;padding:15px;border-radius:14px;text-align:center;font-weight:600;font-size:14px;font-family:Arial,sans-serif;margin-bottom:12px;">
      Alışverişe Git ve Kodu Kullan →
    </a>
    <p style="font-size:12px;color:#9B8EAD;text-align:center;margin:0;line-height:1.6;font-family:Arial,sans-serif;">Kodu sepette "İndirim Kodu" alanına gir. İkinci ürünün %50 indirimli olacak.</p>
  </td></tr>
  <tr><td style="background:#1C1630;padding:20px;text-align:center;">
    <a href="${SHOP_URL}" style="color:rgba(185,165,232,.55);font-size:11px;text-decoration:none;font-family:Arial,sans-serif;">${SHOP_URL.replace('https://', '')}</a>
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

  const html = `<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:36px 16px;background:#F0EDF8;font-family:'Georgia',serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<table width="540" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(43,38,64,.12);max-width:540px;width:100%;">
  <tr><td style="background:linear-gradient(145deg,#1C1630,#5B4A82);padding:28px;text-align:center;">
    <img src="${SITE_URL}/elegance-logo-white.png" alt="Elegance VIP" width="170" style="display:block;margin:0 auto;" />
  </td></tr>
  <tr><td style="padding:32px 36px;">
    <p style="color:#333;font-size:16px;font-family:Arial,sans-serif;">Merhaba <strong>${name}</strong>,</p>
    <p style="color:#5E5878;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      ${day === 3
        ? `ASYA'nın size önerdiği <strong>${productName}</strong> hâlâ sizi bekliyor. Bazen en doğru koku, ilk düşündüğümüzdür 😊`
        : `<strong>${productName}</strong> için son fırsatınız — size özel teklifiniz yarın sona eriyor.`
      }
    </p>
    ${couponCode ? `<p style="color:#5E5878;font-size:14px;font-family:Arial,sans-serif;">Kupon kodunuz: <strong style="color:#5B4A82;font-size:20px;letter-spacing:3px;">${couponCode}</strong></p>` : ''}
    <a href="${productUrl}" style="display:inline-block;background:linear-gradient(135deg,#5B4A82,#8B6FB5);color:#FFF;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:14px;font-family:Arial,sans-serif;font-weight:600;margin-top:8px;">
      Hemen İncele ✨
    </a>
  </td></tr>
  <tr><td style="background:#1C1630;padding:18px;text-align:center;">
    <a href="${SHOP_URL}" style="color:rgba(185,165,232,.55);font-size:11px;text-decoration:none;font-family:Arial,sans-serif;">${SHOP_URL.replace('https://', '')}</a>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  return { subject, html }
}
