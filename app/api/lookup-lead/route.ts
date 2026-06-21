import { NextRequest, NextResponse } from 'next/server'
import { getLeadByEmail } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ found: false })
    }

    const lead = await getLeadByEmail(email)
    if (!lead) return NextResponse.json({ found: false })

    return NextResponse.json({
      found: true,
      name: lead.full_name,
      lead_id: lead.id,
      scent_profile: lead.scent_profile || null,
      gardrop: lead.gardrop || [],
    })
  } catch (err) {
    console.error('Lookup error:', err)
    return NextResponse.json({ found: false })
  }
}
