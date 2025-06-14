-- Create policies that give admin users unrestricted access to all tables

-- First, drop any conflicting policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can insert all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can delete all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Admin users can view all consultants" ON public.consultants;
DROP POLICY IF EXISTS "Admin users can update all consultants" ON public.consultants;
DROP POLICY IF EXISTS "Admin users can insert all consultants" ON public.consultants;
DROP POLICY IF EXISTS "Admin users can delete all consultants" ON public.consultants;

DROP POLICY IF EXISTS "Admin users can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admin users can update all documents" ON public.documents;
DROP POLICY IF EXISTS "Admin users can insert all documents" ON public.documents;
DROP POLICY IF EXISTS "Admin users can delete all documents" ON public.documents;

DROP POLICY IF EXISTS "Admin users can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin users can update all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin users can insert all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin users can delete all appointments" ON public.appointments;

-- Create admin policies for profiles table
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can update all profiles" 
ON public.profiles FOR UPDATE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can insert all profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can delete all profiles" 
ON public.profiles FOR DELETE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

-- Create admin policies for consultants table
CREATE POLICY "Admin users can view all consultants" 
ON public.consultants FOR SELECT 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can update all consultants" 
ON public.consultants FOR UPDATE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can insert all consultants" 
ON public.consultants FOR INSERT 
WITH CHECK (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can delete all consultants" 
ON public.consultants FOR DELETE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

-- Create admin policies for documents table
CREATE POLICY "Admin users can view all documents" 
ON public.documents FOR SELECT 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can update all documents" 
ON public.documents FOR UPDATE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can insert all documents" 
ON public.documents FOR INSERT 
WITH CHECK (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can delete all documents" 
ON public.documents FOR DELETE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

-- Create admin policies for appointments table
CREATE POLICY "Admin users can view all appointments" 
ON public.appointments FOR SELECT 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can update all appointments" 
ON public.appointments FOR UPDATE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can insert all appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');

CREATE POLICY "Admin users can delete all appointments" 
ON public.appointments FOR DELETE 
USING (auth.jwt() ->> 'user_metadata' ? 'user_type' AND auth.jwt() ->> 'user_metadata'::text @> '{"user_type":"admin"}');
