import { NextRequest, NextResponse } from 'next/server'
import { saveLead, saveSession } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email, language = 'tr', mode = 'koku_testi' } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'İsim ve email zorunlu' }, { status: 400 })
    }

    const lead = await saveLead(name, email, language)
    const session = await saveSession(lead.id, mode)

    return NextResponse.json({ lead_id: lead.id, session_id: session.id })
  } catch (err) {
    console.error('Save lead error:', err)
    return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 })
  }
}
