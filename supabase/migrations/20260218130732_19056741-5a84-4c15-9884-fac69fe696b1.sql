-- Tabla para mapear slugs amigables → property_id del CRM
CREATE TABLE IF NOT EXISTS public.property_slugs (
  slug TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  title TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para lookup por property_id (útil para detectar si ya existe el slug de una propiedad)
CREATE INDEX IF NOT EXISTS idx_property_slugs_property_id ON public.property_slugs(property_id);

-- No necesita RLS ya que es una tabla de lookup público (datos ya públicos de propiedades)
ALTER TABLE public.property_slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_slugs_public_read"
  ON public.property_slugs FOR SELECT USING (true);

CREATE POLICY "property_slugs_anon_insert"
  ON public.property_slugs FOR INSERT WITH CHECK (true);

CREATE POLICY "property_slugs_anon_update"
  ON public.property_slugs FOR UPDATE USING (true);
