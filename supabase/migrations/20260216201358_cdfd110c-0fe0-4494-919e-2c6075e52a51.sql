
-- Table to store browser push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (anonymous users)
CREATE POLICY "Anyone can subscribe to push" 
  ON public.push_subscriptions FOR INSERT 
  WITH CHECK (true);

-- Only admins can read subscriptions (for sending notifications)
CREATE POLICY "Admins can view subscriptions" 
  ON public.push_subscriptions FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own subscription by endpoint
CREATE POLICY "Anyone can unsubscribe" 
  ON public.push_subscriptions FOR DELETE 
  USING (true);

-- Index for efficient lookups
CREATE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);
