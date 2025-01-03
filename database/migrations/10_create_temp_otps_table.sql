-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if exists
DROP TABLE IF EXISTS temp_otps CASCADE;

-- Create temp_otps table
CREATE TABLE temp_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX idx_temp_otps_email ON temp_otps(email);
CREATE INDEX idx_temp_otps_otp ON temp_otps(otp);
CREATE INDEX idx_temp_otps_created_at ON temp_otps(created_at);

-- Disable RLS for now
ALTER TABLE temp_otps DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON temp_otps TO authenticated;
GRANT ALL ON temp_otps TO anon;
GRANT ALL ON temp_otps TO service_role;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM temp_otps 
    WHERE created_at < NOW() - INTERVAL '5 minutes'
    OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cleanup
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_otps()
RETURNS trigger AS $$
BEGIN
    PERFORM cleanup_expired_otps();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to run cleanup after each insert
CREATE TRIGGER cleanup_expired_otps_trigger
    AFTER INSERT ON temp_otps
    EXECUTE FUNCTION trigger_cleanup_expired_otps();

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_otp(
    email_address VARCHAR,
    otp_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    is_valid BOOLEAN;
BEGIN
    -- Check if OTP exists and is valid
    SELECT EXISTS (
        SELECT 1 
        FROM temp_otps
        WHERE email = email_address 
        AND otp = otp_code
        AND used = false
        AND created_at > NOW() - INTERVAL '5 minutes'
    ) INTO is_valid;

    -- Mark OTP as used if valid
    IF is_valid THEN
        UPDATE temp_otps 
        SET used = true
        WHERE email = email_address 
        AND otp = otp_code;
    END IF;

    RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 