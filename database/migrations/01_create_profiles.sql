-- Modify profiles table to include email
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add index on email for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add foreign key constraint to ensure user exists
ALTER TABLE profiles 
  ADD CONSTRAINT fk_profiles_users 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE; 