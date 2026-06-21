CREATE TABLE IF NOT EXISTS asya_unboxing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_code TEXT,
  product_name TEXT NOT NULL,
  product_series TEXT,
  lead_id UUID REFERENCES asya_leads(id) ON DELETE SET NULL,
  session_id TEXT,
  questions JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_unboxing_lead ON asya_unboxing_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_unboxing_product ON asya_unboxing_events(product_code);
CREATE INDEX IF NOT EXISTS idx_unboxing_created ON asya_unboxing_events(created_at DESC);
