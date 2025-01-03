-- Create temporary OTP table
CREATE TABLE IF NOT EXISTS temp_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT false
);

-- Create index on phone
CREATE INDEX IF NOT EXISTS idx_temp_otps_phone ON temp_otps(phone);

-- Allow anonymous access for registration
ALTER TABLE temp_otps DISABLE ROW LEVEL SECURITY;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_otp(
  phone_number TEXT,
  otp_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  valid BOOLEAN;
BEGIN
  -- Check if OTP exists and is valid
  SELECT EXISTS (
    SELECT 1 FROM temp_otps
    WHERE phone = phone_number 
    AND otp = otp_code
    AND used = false
    AND created_at > NOW() - INTERVAL '5 minutes'
  ) INTO valid;

  -- Mark OTP as used if valid
  IF valid THEN
    UPDATE temp_otps 
    SET used = true
    WHERE phone = phone_number 
    AND otp = otp_code;
  END IF;

  RETURN valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 