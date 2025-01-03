-- Add email column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add unique constraint on email
ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email); 