CREATE OR REPLACE FUNCTION public.check_lead_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Whitelist: any @pedrotorres10x.es email bypasses rate limit
  IF NEW.email LIKE '%@pedrotorres10x.es' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO recent_count
  FROM public.leads
  WHERE email = NEW.email
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'rate limit exceeded for this email'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;