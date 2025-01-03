-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create temp_otps table
CREATE TABLE IF NOT EXISTS temp_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT false
);

-- Create index on phone
CREATE INDEX IF NOT EXISTS idx_temp_otps_phone ON temp_otps(phone);

-- Disable RLS for now (we'll enable it later with proper policies)
ALTER TABLE temp_otps DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON temp_otps TO authenticated;
GRANT ALL ON temp_otps TO anon;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM temp_otps 
  WHERE created_at < NOW() - INTERVAL '5 minutes'
  OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create cleanup trigger
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_otps()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_otps();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_expired_otps_trigger
  AFTER INSERT ON temp_otps
  EXECUTE FUNCTION trigger_cleanup_expired_otps(); 