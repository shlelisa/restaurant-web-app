-- First backup existing data
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Drop existing foreign key constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add new foreign key constraint to auth.users
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role, authenticated, anon;
GRANT SELECT ON auth.users TO postgres, service_role, authenticated, anon; 