import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient(url, key)
  }
  return _supabase
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey
    _supabaseAdmin = createClient(url, serviceKey)
  }
  return _supabaseAdmin
}

export async function saveLead(name: string, email: string, language = 'tr') {
  const supabase = getSupabaseAdmin()

  // Check if lead already exists (preserve existing name & profile)
  const { data: existing } = await supabase
    .from('asya_leads')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    // Returning user: only touch last_active_at — never overwrite name/profile
    const { data, error } = await supabase
      .from('asya_leads')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  // New user: insert fresh record
  const { data, error } = await supabase
    .from('asya_leads')
    .insert({ full_name: name, email, language, last_active_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLeadByEmail(email: string) {
  const { data } = await getSupabaseAdmin()
    .from('asya_leads')
    .select('id, full_name, email, scent_profile, gardrop')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()
  return data
}

export async function saveLeadProfile(
  leadId: string,
  scentProfile: object,
  gardrop?: object[]
) {
  const updates: Record<string, unknown> = {
    scent_profile: scentProfile,
    last_active_at: new Date().toISOString(),
  }
  if (gardrop !== undefined) updates.gardrop = gardrop
  const { error } = await getSupabaseAdmin()
    .from('asya_leads')
    .update(updates)
    .eq('id', leadId)
  if (error) console.error('saveLeadProfile error:', error)
}

export async function saveLeadGardrop(leadId: string, gardrop: object[]) {
  const { error } = await getSupabaseAdmin()
    .from('asya_leads')
    .update({ gardrop, last_active_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) console.error('saveLeadGardrop error:', error)
}

export async function saveSession(leadId: string, mode: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('asya_sessions')
    .insert({ lead_id: leadId, session_mode: mode })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSession(
  sessionId: string,
  updates: { scent_profile?: object; messages?: object[]; status?: string }
) {
  const { error } = await getSupabaseAdmin()
    .from('asya_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

export async function logEmail(data: {
  lead_id?: string
  email_to: string
  email_name?: string
  email_type: 'profile_ready' | 'referral_coupon' | 'referral_invitee' | 'reminder' | 'followup'
  subject?: string
  status?: 'sent' | 'failed'
  metadata?: Record<string, unknown>
  body?: string
}) {
  const { error } = await getSupabaseAdmin()
    .from('asya_email_logs')
    .insert({
      lead_id: data.lead_id || null,
      email_to: data.email_to,
      email_name: data.email_name || null,
      email_type: data.email_type,
      subject: data.subject || null,
      status: data.status || 'sent',
      metadata: data.metadata || {},
      body: data.body || null,
    })
  if (error) console.error('logEmail error:', error)
}

export async function saveRecommendation(data: {
  lead_id: string
  session_id: string
  gold_code?: string
  gold_name?: string
  gold_url?: string
  elegancia_code?: string
  elegancia_name?: string
  elegancia_url?: string
  home_code?: string
  home_name?: string
  home_url?: string
  scent_profile: object
  language?: string
}) {
  const { data: rec, error } = await getSupabaseAdmin()
    .from('asya_recommendations')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return rec
}
