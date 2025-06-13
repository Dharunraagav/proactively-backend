-- Create a separate table for admin users
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view the admins table
CREATE POLICY "Only admins can view admins table" 
ON public.admins FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.admins));

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add an initial admin user (you'll need to replace with your actual admin user ID)
-- This is just a placeholder - you'll add the real admin via Supabase UI
INSERT INTO public.admins (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com')
ON CONFLICT (id) DO NOTHING;

-- Update existing policies to use the is_admin function
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
CREATE POLICY "Admin users can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin users can insert all profiles" ON public.profiles;
CREATE POLICY "Admin users can insert all profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin users can delete all profiles" ON public.profiles;
CREATE POLICY "Admin users can delete all profiles" 
ON public.profiles FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Repeat for other tables (consultants, documents, appointments)
-- Example for consultants:
DROP POLICY IF EXISTS "Admin users can view all consultants" ON public.consultants;
CREATE POLICY "Admin users can view all consultants" 
ON public.consultants FOR SELECT 
USING (public.is_admin(auth.uid()));

-- And so on for other policies...
