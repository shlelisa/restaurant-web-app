-- Safe migration for profiles table

-- 1. Backup existing data
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 2. Add new columns if they don't exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'or',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": false}'::jsonb;

-- 3. Remove existing foreign key if exists
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS fk_profiles_users;

-- 4. Add new indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Add trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp ON profiles;
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- 6. Remove email column if it exists
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS email;

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role; 