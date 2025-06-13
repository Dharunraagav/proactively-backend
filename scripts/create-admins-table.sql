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

-- Add your admin user(s) to the table
-- Replace the UUID and email with the actual values from your profiles table
INSERT INTO public.admins (id, email)
VALUES 
('5b006484-bbf6-4358-9195-76f0a8d00af4', 'drinnn2004@gmail.com'),
('fe89b27a-af81-4c45-ba91-02ec8fff1b21', 'dharunraagav@gmail.com');

-- Grant necessary permissions
GRANT ALL ON public.admins TO authenticated;
GRANT ALL ON public.admins TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
