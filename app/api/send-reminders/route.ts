import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, logEmail } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()

    // Find reminders whose occasion month/day matches today (upcoming within 7 days)
    const { data: reminders, error } = await getSupabaseAdmin()
      .from('asya_gift_reminders')
      .select(`*, asya_leads(full_name, email)`)
      .eq('reminder_sent', false)

    if (error) throw error

    let sent = 0
    for (const r of reminders || []) {
      const oDate = new Date(r.occasion_date)
      const oMonth = oDate.getMonth() + 1
      const oDay = oDate.getDate()

      // Send reminder if occasion is exactly 7 days away (same month/day next year or this year)
      const daysUntil = daysUntilNextOccurrence(month, day, oMonth, oDay)
      if (daysUntil !== 7) continue

      const lead = (r as any).asya_leads
      if (!lead?.email) continue

      const html = buildReminderEmail({
        name: lead.full_name || 'Değerli Müşterimiz',
        occasionName: r.occasion_name,
        recipientName: r.recipient_name,
        productName: r.product_name,
        productUrl: r.product_url,
        occasionDate: oDate,
      })

      const subject = `${r.occasion_name} yaklaşıyor — ASYA size özel bir hatırlatma gönderdi 🎁`
      const ok = await sendEmail({
        to: lead.email,
        toName: lead.full_name || '',
        subject,
        html,
      })

      logEmail({
        email_to: lead.email,
        email_name: lead.full_name || '',
        email_type: 'reminder',
        subject,
        status: ok ? 'sent' : 'failed',
        metadata: { occasion_name: r.occasion_name, recipient_name: r.recipient_name, product_name: r.product_name },
      }).catch(e => console.error('logEmail error:', e))

      await getSupabaseAdmin()
        .from('asya_gift_reminders')
        .update({ reminder_sent: true, last_sent_at: new Date().toISOString() })
        .eq('id', r.id)

      sent++
    }

    return NextResponse.json({ success: true, sent })
  } catch (err) {
    console.error('send-reminders error:', err)
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 })
  }
}

function daysUntilNextOccurrence(todayMonth: number, todayDay: number, oMonth: number, oDay: number): number {
  const now = new Date(new Date().getFullYear(), todayMonth - 1, todayDay)
  let next = new Date(now.getFullYear(), oMonth - 1, oDay)
  if (next <= now) next.setFullYear(next.getFullYear() + 1)
  return Math.round((next.getTime() - now.getTime()) / 86400000)
}

function buildReminderEmail(params: {
  name: string
  occasionName: string
  recipientName?: string
  productName?: string
  productUrl?: string
  occasionDate: Date
}) {
  const { name, occasionName, recipientName, productName, productUrl, occasionDate } = params
  const dateStr = occasionDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3f8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(43,38,64,0.12);">
        <tr><td style="background:linear-gradient(135deg,#2B2640,#5B4A82);padding:36px;text-align:center;">
          <p style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;font-family:Arial,sans-serif;">Elegance VIP Perfume</p>
          <h1 style="color:#fff;font-size:24px;margin:0 0 6px;font-weight:400;">ASYA Hatırlatması 🎁</h1>
          <p style="color:rgba(185,165,232,0.9);font-size:13px;margin:0;font-family:Arial,sans-serif;">${occasionName} yaklaşıyor — ${dateStr}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#2B2640;font-size:16px;margin:0 0 12px;font-family:Arial,sans-serif;">Merhaba <strong>${name}</strong>,</p>
          <p style="color:#5E5878;font-size:15px;line-height:1.7;margin:0 0 20px;">
            ${recipientName ? `<strong>${recipientName}</strong> için` : 'Sevdiğiniz biri için'} kaydettiğiniz <strong>${occasionName}</strong> sadece 7 gün kaldı!
            ASYA sizi hazırlıklı yakalamak istedi 🌸
          </p>
          ${productName && productUrl ? `
          <div style="padding:20px;border-radius:14px;background:#faf8f5;border:1px solid rgba(185,165,232,0.2);margin-bottom:20px;">
            <p style="color:#8A85A1;font-size:10px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;font-family:Arial,sans-serif;">Önerilen Koku</p>
            <p style="color:#2B2640;font-size:18px;margin:0 0 12px;font-weight:500;">${productName}</p>
            <a href="${productUrl}" style="background:linear-gradient(135deg,#B9A5E8,#9FB4E0);color:#fff;text-decoration:none;padding:10px 22px;border-radius:20px;font-size:13px;display:inline-block;font-family:Arial,sans-serif;">
              Hemen İncele →
            </a>
          </div>
          ` : ''}
          <p style="color:#8A85A1;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
            Yeni bir öneri için <a href="https://asya.elegancevipperfume.com" style="color:#5B4A82;">ASYA ile sohbet edebilirsiniz</a>.
          </p>
        </td></tr>
        <tr><td style="background:#2B2640;padding:20px;text-align:center;">
          <a href="https://www.elegancevipperfume.com" style="color:rgba(185,165,232,0.7);font-size:11px;text-decoration:none;font-family:Arial,sans-serif;">www.elegancevipperfume.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
