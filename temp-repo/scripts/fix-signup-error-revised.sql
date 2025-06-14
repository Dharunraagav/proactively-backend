-- First, drop all policies that depend on the id column
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can do anything with profiles" ON public.profiles;

-- Drop the trigger that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Make sure profiles table doesn't have any foreign key constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Now we can safely alter the column type if needed
-- But first check if it's already UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    RAISE NOTICE 'Column id is already UUID type, no need to alter';
  ELSE
    ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::UUID;
  END IF;
END $$;

-- Add primary key constraint
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Create very permissive policies
CREATE POLICY "Anyone can do anything with profiles" 
ON public.profiles FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
