import { NextRequest, NextResponse } from 'next/server'
import { saveLead, saveSession, getLeadByEmail } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email, language = 'tr', mode = 'koku_testi' } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'İsim ve email zorunlu' }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Geçersiz email formatı' }, { status: 400 })
    }

    // Basic input sanitization
    const safeName  = String(name).trim().slice(0, 120)
    const safeEmail = String(email).trim().toLowerCase().slice(0, 254)

    const lead = await saveLead(safeName, safeEmail, language)
    const session = await saveSession(lead.id, mode)

    return NextResponse.json({
      lead_id: lead.id,
      session_id: session.id,
      returning: lead.scent_profile != null,
      scent_profile: lead.scent_profile || null,
      gardrop: lead.gardrop || [],
      name: lead.full_name,
    })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 })
  }
}
