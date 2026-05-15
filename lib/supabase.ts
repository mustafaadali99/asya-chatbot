import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function saveLead(name: string, email: string, language = 'tr') {
  const { data, error } = await supabaseAdmin
    .from('asya_leads')
    .upsert({ full_name: name, email, language }, { onConflict: 'email' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveSession(leadId: string, mode: string) {
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
    .from('asya_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
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
  const { data: rec, error } = await supabaseAdmin
    .from('asya_recommendations')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return rec
}
