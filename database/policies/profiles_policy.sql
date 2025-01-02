-- Temporarily disable RLS for registration
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create trigger to enable RLS after some time
CREATE OR REPLACE FUNCTION enable_rls_after_delay() 
RETURNS void AS $$
BEGIN
  -- Wait for 1 minute then enable RLS
  PERFORM pg_sleep(60);
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql;

-- Schedule the trigger to run
SELECT enable_rls_after_delay();

-- Keep the policies ready for when RLS is re-enabled
CREATE POLICY "Enable insert for authenticated users"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for users based on user_id"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for user based on user_id"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;

-- Enable anon access for public profiles if needed
CREATE POLICY "Enable public read access"
ON profiles FOR SELECT
TO anon
USING (true); 