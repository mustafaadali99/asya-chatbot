-- Gifting Engine: stores special occasion dates for reminder emails
CREATE TABLE IF NOT EXISTS asya_gift_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES asya_leads(id) ON DELETE CASCADE,
  occasion_name TEXT NOT NULL,
  occasion_date DATE NOT NULL,
  recipient_name TEXT,
  product_name TEXT,
  product_url TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient daily cron query
CREATE INDEX IF NOT EXISTS idx_gift_reminders_lead ON asya_gift_reminders(lead_id);
CREATE INDEX IF NOT EXISTS idx_gift_reminders_unsent ON asya_gift_reminders(reminder_sent) WHERE reminder_sent = FALSE;
