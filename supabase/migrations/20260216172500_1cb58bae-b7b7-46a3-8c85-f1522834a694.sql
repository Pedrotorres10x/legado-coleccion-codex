
-- Roles system first
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Property enums
CREATE TYPE public.property_type AS ENUM ('piso', 'casa', 'villa', 'atico', 'duplex', 'chalet', 'estudio', 'local', 'otro');
CREATE TYPE public.property_status AS ENUM ('disponible', 'reservado', 'vendido');

-- Properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_type public.property_type NOT NULL DEFAULT 'piso',
  status public.property_status NOT NULL DEFAULT 'disponible',
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  area_m2 NUMERIC NOT NULL DEFAULT 0,
  year_built INTEGER,
  floor INTEGER,
  has_garage BOOLEAN DEFAULT false,
  has_pool BOOLEAN DEFAULT false,
  has_terrace BOOLEAN DEFAULT false,
  has_elevator BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are viewable by everyone"
ON public.properties FOR SELECT USING (true);

CREATE POLICY "Admins can manage properties"
ON public.properties FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'property-images');

-- Indexes
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_location ON public.properties(location);
CREATE INDEX idx_properties_featured ON public.properties(is_featured) WHERE is_featured = true;
