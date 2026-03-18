-- Remove overly permissive INSERT on push_notification_log
-- Edge functions use service_role which bypasses RLS, so this policy is unnecessary
DROP POLICY IF EXISTS "Service can insert notification logs" ON public.push_notification_log;