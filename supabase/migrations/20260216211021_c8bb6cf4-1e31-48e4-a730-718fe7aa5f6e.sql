
-- Drop the overly permissive ALL policy and replace with restrictive ones
DROP POLICY "Service role can manage featured cache" ON public.featured_cache;

-- Only service_role can insert/update/delete (edge functions use service_role key)
-- No policy = denied for anon/authenticated, service_role bypasses RLS
