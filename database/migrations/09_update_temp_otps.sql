-- Add email column to temp_otps
ALTER TABLE temp_otps 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add index on email
CREATE INDEX IF NOT EXISTS idx_temp_otps_email 
ON temp_otps(email);

-- Update cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM temp_otps 
  WHERE created_at < NOW() - INTERVAL '5 minutes'
  OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 