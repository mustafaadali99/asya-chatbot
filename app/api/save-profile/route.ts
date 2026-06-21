import { NextRequest, NextResponse } from 'next/server'
import { saveLeadProfile, saveLeadGardrop, getSupabaseAdmin } from '@/lib/supabase'

// UUID v4 regex
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const { lead_id, scent_profile, gardrop } = await req.json()

    // lead_id must be a valid UUID
    if (!lead_id || !UUID_RE.test(lead_id)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Verify the lead actually exists in DB (ownership guard)
    const { data: lead, error: leadErr } = await getSupabaseAdmin()
      .from('asya_leads')
      .select('id')
      .eq('id', lead_id)
      .single()

    if (leadErr || !lead) {
      return NextResponse.json({ ok: false }, { status: 404 })
    }

    // Payload size guard — reject oversized JSON (> 50 KB)
    const payloadSize = JSON.stringify({ scent_profile, gardrop }).length
    if (payloadSize > 50_000) {
      return NextResponse.json({ ok: false }, { status: 413 })
    }

    if (scent_profile) {
      await saveLeadProfile(lead_id, scent_profile, gardrop)
    } else if (gardrop) {
      await saveLeadGardrop(lead_id, gardrop)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Save profile error:', err)
    return NextResponse.json({ ok: false })
  }
}
