
-- Cache for AI-scored featured properties, refreshed every 24h
CREATE TABLE public.featured_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_data JSONB NOT NULL,
  image_score NUMERIC(3,1) NOT NULL DEFAULT 0,
  ai_analysis TEXT,
  refreshed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public read
ALTER TABLE public.featured_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured cache is publicly readable"
  ON public.featured_cache FOR SELECT
  USING (true);

-- Only edge functions (service role) can write
CREATE POLICY "Service role can manage featured cache"
  ON public.featured_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for ordering by score
CREATE INDEX idx_featured_cache_score ON public.featured_cache(image_score DESC);
