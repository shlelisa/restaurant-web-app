-- First backup existing data
CREATE TABLE IF NOT EXISTS profiles_backup AS SELECT * FROM profiles;

-- Drop the foreign key constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Drop RLS policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for user based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable public read access" ON profiles;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO service_role; 