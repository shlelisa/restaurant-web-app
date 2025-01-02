-- First, enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert sample users
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified) VALUES
(uuid_generate_v4(), 'admin@example.com', '+251911234567', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J2YrInuMS', 'admin', 'active', true),
(uuid_generate_v4(), 'staff@example.com', '+251922334455', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J2YrInuMS', 'staff', 'active', true),
(uuid_generate_v4(), 'customer@example.com', '+251933445566', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J2YrInuMS', 'customer', 'active', true);

-- Get the user IDs for reference
WITH user_ids AS (
  SELECT id, email FROM users 
  WHERE email IN ('admin@example.com', 'staff@example.com', 'customer@example.com')
)

-- Insert corresponding profiles
INSERT INTO profiles (id, user_id, first_name, last_name, language)
SELECT 
  uuid_generate_v4(),
  u.id,
  CASE 
    WHEN u.email = 'admin@example.com' THEN 'Gammachuu'
    WHEN u.email = 'staff@example.com' THEN 'Tolasaa'
    WHEN u.email = 'customer@example.com' THEN 'Caaltuu'
  END,
  CASE 
    WHEN u.email = 'admin@example.com' THEN 'Dabalaa'
    WHEN u.email = 'staff@example.com' THEN 'Hundee'
    WHEN u.email = 'customer@example.com' THEN 'Mokonnin'
  END,
  'or'
FROM user_ids u;

-- Insert sample addresses
INSERT INTO addresses (user_id, type, address_line1, city, is_default)
SELECT 
    id,
    'home',
    CASE 
        WHEN email LIKE 'gammachuu%' THEN 'Bole Road, Building A5'
        WHEN email LIKE 'tolasaa%' THEN 'Gerji, House 123'
        WHEN email LIKE 'caaltuu%' THEN 'CMC, Block 5'
        WHEN email LIKE 'fayyisaa%' THEN 'Ayat, House 456'
        WHEN email LIKE 'ayantu%' THEN 'Summit, Building B2'
        WHEN email LIKE 'dabala%' THEN 'Lebu, House 789'
        WHEN email LIKE 'hawwii%' THEN 'Jemo, Block 3'
        WHEN email LIKE 'bontu%' THEN 'Megenagna, Building C1'
        WHEN email LIKE 'ebisaa%' THEN 'Sarbet, House 321'
        WHEN email LIKE 'lammii%' THEN 'Kazanchis, Building D4'
    END,
    'Finfinne',
    true
FROM users; 