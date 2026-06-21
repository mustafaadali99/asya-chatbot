import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

const REPORT_EMAIL = 'mustafa.adali99@gmail.com'
const REPORT_NAME  = 'Mustafa'
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || 'https://asya.elegancevipperfume.com'
const SHOP_URL     = 'https://www.elegancevipperfume.com'
const WOO_URL      = process.env.WC_SITE_URL || process.env.WOOCOMMERCE_URL || SHOP_URL
const WOO_KEY      = process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY || ''
const WOO_SECRET   = process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET || ''

export async function GET(req: NextRequest) {
  /* Cron güvenliği */
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    /* ── Bugünün tarihi (TR zamanı UTC+3) ── */
    const now   = new Date()
    const trNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    const today = trNow.toISOString().slice(0, 10)           // "2026-05-19"
    const todayStart = `${today}T00:00:00+03:00`
    const todayEnd   = `${today}T23:59:59+03:00`

    /* ── Bugün profil_ready maili gidenler ── */
    const { data: logs, error: logsErr } = await getSupabaseAdmin()
      .from('asya_email_logs')
      .select('*')
      .eq('email_type', 'profile_ready')
      .eq('status', 'sent')
      .gte('sent_at', todayStart)
      .lte('sent_at', todayEnd)

    if (logsErr) throw logsErr
    if (!logs || logs.length === 0) {
      return NextResponse.json({ skipped: true, reason: 'Bugün kullanıcı yok' })
    }

    /* ── Lead detayları ── */
    const leadIds = logs.map(l => l.lead_id).filter(Boolean)
    const { data: leads } = await getSupabaseAdmin()
      .from('asya_leads')
      .select('id, full_name, email, scent_profile, created_at')
      .in('id', leadIds)

    /* ── Toplam kullanıcı sayısı (tüm zamanlar) ── */
    const { count: totalCount } = await getSupabaseAdmin()
      .from('asya_email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('email_type', 'profile_ready')
      .eq('status', 'sent')

    /* ── WooCommerce sipariş kontrolü ── */
    const purchaseMap: Record<string, { bought: boolean; orderTotal?: string; orderDate?: string; products?: string }> = {}

    if (WOO_KEY && WOO_SECRET) {
      try {
        // Bugünün tüm siparişlerini tek seferde çek
        const wooRes = await fetch(
          `${WOO_URL}/wp-json/wc/v3/orders?per_page=50&orderby=date&order=desc&after=${encodeURIComponent(todayStart)}`,
          {
            headers: {
              Authorization: 'Basic ' + Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64'),
            },
          }
        )
        const allOrders = wooRes.ok ? await wooRes.json() : []

        // Her log için billing.email ile eşleştir
        for (const log of logs) {
          if (!log.email_to) continue
          const logDate = new Date(log.sent_at)
          const emailLower = log.email_to.toLowerCase()

          const matchingOrders = allOrders.filter((o: {
            billing?: { email?: string }
            date_created_gmt?: string
            date_created?: string
          }) => {
            const billingEmail = (o.billing?.email || '').toLowerCase()
            const orderDate = new Date(o.date_created_gmt || o.date_created || 0)
            // Hem email eşleşmeli hem de ASYA'yı kullandıktan sonra sipariş verilmiş olmalı
            return billingEmail === emailLower && orderDate >= logDate
          })

          if (matchingOrders.length > 0) {
            const o = matchingOrders[0]
            purchaseMap[log.email_to] = {
              bought: true,
              orderTotal: `${o.total} TL`,
              orderDate:  new Date(o.date_created).toLocaleDateString('tr-TR'),
              products:   o.line_items?.map((i: { name: string }) => i.name).join(', ') || '',
            }
          } else {
            purchaseMap[log.email_to] = { bought: false }
          }
        }
      } catch {
        for (const log of logs) {
          if (log.email_to) purchaseMap[log.email_to] = { bought: false }
        }
      }
    }

    /* ── Kullanıcı satırları HTML ── */
    const leadMap: Record<string, { full_name: string; email: string; scent_profile: { title?: string } }> = {}
    for (const l of (leads || [])) leadMap[l.id] = l

    const boughtCount = Object.values(purchaseMap).filter(p => p.bought).length

    const userRows = logs.map((log, i) => {
      const lead    = leadMap[log.lead_id] || {}
      const name    = lead.full_name  || log.email_name || '—'
      const email   = log.email_to   || '—'
      const profile = lead.scent_profile?.title || '—'
      const products: string[] = log.metadata?.products || []
      const coupon  = log.metadata?.coupon || '—'
      const hour    = new Date(log.sent_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
      const purchase = purchaseMap[email]

      const purchaseBadge = !WOO_KEY ? '' :
        purchase?.bought
          ? `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#D1FAE5;color:#065F46;font-size:10px;font-weight:700;font-family:Arial;">✓ SATIN ALDI · ${purchase.orderTotal}</span>`
          : `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#FEE2E2;color:#991B1B;font-size:10px;font-weight:700;font-family:Arial;">✗ Henüz almadı</span>`

      return `
      <tr style="background:${i % 2 === 0 ? '#FAFAFA' : '#F5F2FC'};">
        <td style="padding:14px 16px;border-bottom:1px solid #EEE;">
          <div style="font-weight:700;font-size:14px;color:#2B2640;font-family:Arial;">${name}</div>
          <div style="font-size:12px;color:#7B6FA0;margin-top:2px;font-family:Arial;">${email}</div>
          <div style="font-size:11px;color:#9B8EAD;margin-top:1px;font-family:Arial;">⏰ ${hour}</div>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #EEE;vertical-align:top;">
          <div style="font-size:12px;font-weight:600;color:#5B4A82;margin-bottom:4px;font-family:Arial;">✦ ${profile}</div>
          ${products.map(p => `<div style="font-size:11px;color:#5E5878;font-family:Arial;">• ${p}</div>`).join('')}
          ${coupon !== '—' ? `<div style="font-size:10px;color:#9B8EAD;margin-top:4px;font-family:monospace;letter-spacing:1px;">${coupon}</div>` : ''}
        </td>
        ${WOO_KEY ? `<td style="padding:14px 16px;border-bottom:1px solid #EEE;vertical-align:top;">${purchaseBadge}${purchase?.bought && purchase.products ? `<div style="font-size:10px;color:#5E5878;margin-top:6px;font-family:Arial;">${purchase.products}</div>` : ''}</td>` : ''}
      </tr>`
    }).join('')

    /* ── Koku özeti ── */
    const perfumeCount: Record<string, number> = {}
    for (const log of logs) {
      const prods: string[] = log.metadata?.products || []
      for (const p of prods) perfumeCount[p] = (perfumeCount[p] || 0) + 1
    }
    const topPerfumes = Object.entries(perfumeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const perfumeRows = topPerfumes.map(([name, count]) =>
      `<tr>
        <td style="padding:8px 16px;font-size:13px;color:#2B2640;font-family:Arial;border-bottom:1px solid #EEE;">• ${name}</td>
        <td style="padding:8px 16px;font-size:13px;font-weight:700;color:#5B4A82;font-family:Arial;border-bottom:1px solid #EEE;text-align:right;">${count}x</td>
      </tr>`
    ).join('')

    /* ── Mail HTML ── */
    const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#EDEAF5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EDEAF5;padding:32px 16px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="background:#FFF;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(43,38,64,.14);max-width:620px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(145deg,#2B2640,#5B4A82);padding:32px 36px;text-align:center;">
    <img src="${SITE_URL}/elegance-logo-white.png" alt="Elegance VIP" width="200" style="display:block;margin:0 auto 18px;" />
    <p style="color:rgba(210,195,240,.75);font-size:10px;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;">Günlük Rapor · ${today}</p>
    <h1 style="color:#FFF;font-size:26px;margin:0;font-weight:400;">ASYA Koku Asistanı<br/><em style="font-style:italic;">Günlük Aktivite Raporu</em></h1>
  </td></tr>

  <!-- ÖZET KARTLAR -->
  <tr><td style="padding:28px 36px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="33%" style="padding:4px;">
        <div style="background:linear-gradient(135deg,#F2EDFC,#EDF2FC);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(185,165,232,.25);">
          <div style="font-size:36px;font-weight:800;color:#5B4A82;">${logs.length}</div>
          <div style="font-size:11px;color:#7B6FA0;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Bugün Kullanan</div>
        </div>
      </td>
      <td width="33%" style="padding:4px;">
        <div style="background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(5,150,105,.15);">
          <div style="font-size:36px;font-weight:800;color:#059669;">${boughtCount}</div>
          <div style="font-size:11px;color:#059669;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Satın Alan</div>
        </div>
      </td>
      <td width="33%" style="padding:4px;">
        <div style="background:linear-gradient(135deg,#FFF8F0,#FEF3E2);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(245,158,11,.20);">
          <div style="font-size:36px;font-weight:800;color:#D97706;">${totalCount || 0}</div>
          <div style="font-size:11px;color:#D97706;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Toplam Kullanıcı</div>
        </div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- KULLANICI TABLOSU -->
  <tr><td style="padding:8px 36px 0;">
    <p style="font-size:10px;letter-spacing:3px;color:#7B6FA0;font-weight:700;text-transform:uppercase;margin:0 0 12px;">Bugünün Kullanıcıları</p>
    <table width="100%" style="border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
      <tr style="background:#2B2640;">
        <th style="padding:10px 16px;text-align:left;font-size:11px;color:rgba(210,195,240,.80);font-weight:600;letter-spacing:1px;text-transform:uppercase;">Kişi</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;color:rgba(210,195,240,.80);font-weight:600;letter-spacing:1px;text-transform:uppercase;">Profil & Önerilen Kokular</th>
        ${WOO_KEY ? '<th style="padding:10px 16px;text-align:left;font-size:11px;color:rgba(210,195,240,.80);font-weight:600;letter-spacing:1px;text-transform:uppercase;">Satın Alma</th>' : ''}
      </tr>
      ${userRows}
    </table>
  </td></tr>

  <!-- EN ÇOK ÖNERILEN KOKULAR -->
  ${topPerfumes.length > 0 ? `
  <tr><td style="padding:24px 36px 0;">
    <p style="font-size:10px;letter-spacing:3px;color:#7B6FA0;font-weight:700;text-transform:uppercase;margin:0 0 12px;">Bugün En Çok Önerilen Kokular</p>
    <table width="100%" style="border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
      ${perfumeRows}
    </table>
  </td></tr>` : ''}

  <!-- FOOTER -->
  <tr><td style="padding:28px 36px;text-align:center;">
    <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#5B4A82,#8B6FB5);color:#FFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:13px;font-weight:600;">
      ASYA Paneline Git →
    </a>
    <p style="font-size:11px;color:#B0A8C8;margin:16px 0 0;">Bu rapor her gün 21:00'de otomatik olarak gönderilir (sadece aktif gün).</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    const subject = `📊 ASYA Raporu ${today} — Bugün ${logs.length} kişi kullandı${boughtCount > 0 ? `, ${boughtCount} satın aldı 🎉` : ''}`

    await sendEmail({
      to: REPORT_EMAIL,
      toName: REPORT_NAME,
      subject,
      html,
    })

    return NextResponse.json({ success: true, sent_to: REPORT_EMAIL, users: logs.length, bought: boughtCount })
  } catch (err) {
    console.error('daily-report error:', err)
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 })
  }
}
