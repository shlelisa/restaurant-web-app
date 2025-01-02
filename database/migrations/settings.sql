-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if exists
DROP TABLE IF EXISTS settings CASCADE;

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant JSONB NOT NULL DEFAULT '{
    "name": "Nyaata Aadaa",
    "description": "Nyaata Aadaa Oromoo",
    "phone": "+251911234567",
    "address": "Finfinne, Ethiopia",
    "openHours": "8:00 AM - 10:00 PM",
    "logo": null,
    "category": "restaurant"
  }'::jsonb,
  payment JSONB NOT NULL DEFAULT '{
    "acceptCash": true,
    "acceptCard": true,
    "acceptMobile": true,
    "telebirr": "+251911234567",
    "cbebirr": "+251911234567",
    "minOrderAmount": 100,
    "category": "payment"
  }'::jsonb,
  notifications JSONB NOT NULL DEFAULT '{
    "orderConfirmation": true,
    "orderStatus": true,
    "promotions": false,
    "email": true,
    "sms": true,
    "pushNotifications": false,
    "category": "notifications"
  }'::jsonb,
  system JSONB NOT NULL DEFAULT '{
    "language": "or",
    "currency": "ETB",
    "timezone": "Africa/Addis_Ababa",
    "autoAcceptOrders": false,
    "orderTimeout": 30,
    "maxOrdersPerHour": 50,
    "category": "system"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (id, restaurant, payment, notifications, system)
VALUES (
  uuid_generate_v4(),
  '{
    "name": "Nyaata Aadaa",
    "description": "Nyaata Aadaa Oromoo",
    "phone": "+251911234567",
    "address": "Finfinne, Ethiopia",
    "openHours": "8:00 AM - 10:00 PM",
    "logo": null,
    "category": "restaurant"
  }'::jsonb,
  '{
    "acceptCash": true,
    "acceptCard": true,
    "acceptMobile": true,
    "telebirr": "+251911234567",
    "cbebirr": "+251911234567",
    "minOrderAmount": 100,
    "category": "payment"
  }'::jsonb,
  '{
    "orderConfirmation": true,
    "orderStatus": true,
    "promotions": false,
    "email": true,
    "sms": true,
    "pushNotifications": false,
    "category": "notifications"
  }'::jsonb,
  '{
    "language": "or",
    "currency": "ETB",
    "timezone": "Africa/Addis_Ababa",
    "autoAcceptOrders": false,
    "orderTimeout": 30,
    "maxOrdersPerHour": 50,
    "category": "system"
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for settings files
INSERT INTO storage.buckets (id, name)
VALUES ('settings', 'settings')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for settings bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'settings');

CREATE POLICY "Auth Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'settings' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'settings' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'settings' AND auth.role() = 'authenticated'); 