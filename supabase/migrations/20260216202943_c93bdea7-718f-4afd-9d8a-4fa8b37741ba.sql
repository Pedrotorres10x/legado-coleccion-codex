
-- Create push_notification_log table
CREATE TABLE public.push_notification_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  url text,
  total_sent integer DEFAULT 0,
  metadata jsonb,
  sent_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_notification_log ENABLE ROW LEVEL SECURITY;

-- Admins can view logs
CREATE POLICY "Admins can view notification logs"
ON public.push_notification_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role (edge functions) to insert
CREATE POLICY "Service can insert notification logs"
ON public.push_notification_log
FOR INSERT
WITH CHECK (true);
