
-- Add term_token to influencer_partnerships for unique acceptance links
ALTER TABLE public.influencer_partnerships
ADD COLUMN IF NOT EXISTS term_token UUID DEFAULT gen_random_uuid();

-- Create unique index on term_token
CREATE UNIQUE INDEX IF NOT EXISTS idx_influencer_partnerships_term_token ON public.influencer_partnerships(term_token);

-- Update existing rows that might have null tokens
UPDATE public.influencer_partnerships SET term_token = gen_random_uuid() WHERE term_token IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.influencer_partnerships ALTER COLUMN term_token SET NOT NULL;
ALTER TABLE public.influencer_partnerships ALTER COLUMN term_token SET DEFAULT gen_random_uuid();
