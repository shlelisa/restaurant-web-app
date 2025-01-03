-- Create function to store OTP
CREATE OR REPLACE FUNCTION send_otp(
  phone_number TEXT,
  otp_code TEXT
) RETURNS json AS $$
BEGIN
  -- Store OTP in temporary table
  INSERT INTO temp_otps (phone, otp, created_at)
  VALUES (phone_number, otp_code, NOW());

  -- In development, just return success
  RETURN json_build_object(
    'success', true,
    'message', 'OTP stored successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create temporary table for OTPs
CREATE TABLE IF NOT EXISTS temp_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT false
);

-- Create index on phone
CREATE INDEX IF NOT EXISTS idx_temp_otps_phone ON temp_otps(phone);

-- Add expiration trigger
CREATE OR REPLACE FUNCTION delete_expired_otps() RETURNS trigger AS $$
BEGIN
  DELETE FROM temp_otps 
  WHERE created_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_expired_otps
  AFTER INSERT ON temp_otps
  EXECUTE FUNCTION delete_expired_otps(); 