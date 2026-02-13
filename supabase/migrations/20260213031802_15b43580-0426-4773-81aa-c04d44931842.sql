
-- Create influencer_partnerships table
CREATE TABLE public.influencer_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instagram_handle TEXT,
  commission_percent NUMERIC NOT NULL CHECK (commission_percent >= 1 AND commission_percent <= 3),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.influencer_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on influencer_partnerships"
  ON public.influencer_partnerships
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Create influencer_payments table
CREATE TABLE public.influencer_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.influencer_partnerships(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  mrr_base NUMERIC NOT NULL DEFAULT 0,
  commission_percent NUMERIC NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.influencer_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on influencer_payments"
  ON public.influencer_payments
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
