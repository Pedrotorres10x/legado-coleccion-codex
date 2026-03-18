ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
