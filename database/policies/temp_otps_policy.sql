-- Enable RLS
ALTER TABLE temp_otps ENABLE ROW LEVEL SECURITY;

-- Allow insert for all authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON temp_otps FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow select for matching phone numbers
CREATE POLICY "Allow select for matching phone"
ON temp_otps FOR SELECT 
TO authenticated
USING (phone = current_user_phone());

-- Allow update for matching phone numbers
CREATE POLICY "Allow update for matching phone"
ON temp_otps FOR UPDATE
TO authenticated
USING (phone = current_user_phone());

-- Create function to get current user's phone
CREATE OR REPLACE FUNCTION current_user_phone() 
RETURNS TEXT AS $$
  SELECT phone 
  FROM profiles 
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER; 