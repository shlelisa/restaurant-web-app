-- First delete existing menu items and categories
DELETE FROM menu_items;
DELETE FROM categories;

-- Insert categories
INSERT INTO categories (id, name, description, sort_order, is_active) VALUES
(uuid_generate_v4(), 'Nyaata', 'Nyaata aadaa Oromoo', 1, true),
(uuid_generate_v4(), 'Dhugaatii', 'Dhugaatii aadaa Oromoo', 2, true),
(uuid_generate_v4(), 'Mishinga', 'Foon mishingaa', 3, true),
(uuid_generate_v4(), 'Daadhii', 'Daadhii aadaa', 4, true);

-- Add nutritional_info column if not exists
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS nutritional_info JSONB;

-- Insert all menu items
WITH category_ids AS (
  SELECT id, name FROM categories
  WHERE name IN ('Nyaata', 'Dhugaatii', 'Mishinga', 'Daadhii')
)
INSERT INTO menu_items (name, category_id, price, description, is_available, image_url) 
SELECT 
  m.name,
  c.id as category_id,
  m.price,
  m.description,
  m.is_available,
  m.image_url
FROM (
  VALUES
    -- Nyaata
    ('Marqaa fi Anchootee', 'Nyaata', 250, 'Marqaa fi Anchooftee aadaa oromoo kan bifa addaa ta''e', true, 'https://example.com/images/marqaa.jpg'),
    ('Kurkuffaa', 'Nyaata', 180, 'Kurkuffaa aadaa kan nyaata guyyaa', true, 'https://example.com/images/kurkuffa.jpg'),
    ('Qincee', 'Nyaata', 200, 'Qincee aadaa kan nyaata guyyaa', true, 'https://example.com/images/qincee.jpg'),
    ('Caccabsaa', 'Nyaata', 150, 'Caccabsaa aadaa kan nyaata guyyaa', true, 'https://example.com/images/caccabsaa.jpg'),
    ('Biddeena', 'Nyaata', 120, 'Biddeena aadaa kan qamadii irraa hojjetame', true, 'https://example.com/images/biddena.jpg'),
    ('Marmara', 'Nyaata', 160, 'Marmara aadaa kan daakuu qamadii', true, 'https://example.com/images/marmara.jpg'),
    ('Qorii', 'Nyaata', 220, 'Qorii aadaa kan nyaata guyyaa', true, 'https://example.com/images/qorii.jpg'),
    ('Waaddii', 'Nyaata', 140, 'Waaddii aadaa kan xaafii', true, 'https://example.com/images/waadii.jpg'),
    
    -- Dhugaatii
    ('Faarso', 'Dhugaatii', 80, 'Faarso aadaa kan dhugaatii guyyaa', true, 'https://example.com/images/faarso.jpg'),
    ('Daadhii', 'Daadhii', 100, 'Daadhii aadaa kan dhugaatii guyyaa', true, 'https://example.com/images/daadhii.jpg'),
    ('Booka', 'Dhugaatii', 70, 'Booka aadaa kan dhugaatii guyyaa', true, 'https://example.com/images/booka.jpg'),
    ('Shameta', 'Dhugaatii', 60, 'Shameta aadaa kan qorraa', true, 'https://example.com/images/shameta.jpg'),
    ('Buquri', 'Dhugaatii', 90, 'Buquri aadaa kan garbuu', true, 'https://example.com/images/buquri.jpg'),
    ('Araqee', 'Dhugaatii', 120, 'Araqee aadaa kan dhugaatii', true, 'https://example.com/images/araqee.jpg'),
    
    -- Mishinga
    ('Kuulle', 'Mishinga', 300, 'Foon mishingaa kan aadaa', true, 'https://example.com/images/kuulle.jpg'),
    ('Tibs', 'Mishinga', 350, 'Tibs mishingaa kan aadaa', true, 'https://example.com/images/tibs.jpg'),
    ('Qurstii', 'Mishinga', 280, 'Qurstii mishingaa kan aadaa', true, 'https://example.com/images/qurstii.jpg'),
    ('Anchootee', 'Mishinga', 280, 'Anchootee aadaa kan foon mishingaa', true, 'https://example.com/images/anchotee.jpg'),
    ('Qalaa', 'Mishinga', 320, 'Qalaa mishingaa kan aadaa', true, 'https://example.com/images/qalaa.jpg'),
    ('Waaddii Foon', 'Mishinga', 260, 'Waaddii foon mishingaa', true, 'https://example.com/images/waadii-foon.jpg')
) as m(name, category_name, price, description, is_available, image_url)
JOIN category_ids c ON c.name = m.category_name;

-- Update nutritional information
WITH category_ids AS (
  SELECT id, name FROM categories
  WHERE name = 'Nyaata'
)
UPDATE menu_items 
SET nutritional_info = jsonb_build_object(
  'calories', 400,
  'protein', '12g',
  'carbs', '55g',
  'fat', '10g'
)
FROM category_ids
WHERE category_id = category_ids.id;

WITH category_ids AS (
  SELECT id, name FROM categories
  WHERE name IN ('Dhugaatii', 'Daadhii')
)
UPDATE menu_items 
SET nutritional_info = jsonb_build_object(
  'calories', 200,
  'alcohol', '4.5%',
  'carbs', '20g'
)
FROM category_ids
WHERE category_id = category_ids.id;

WITH category_ids AS (
  SELECT id, name FROM categories
  WHERE name = 'Mishinga'
)
UPDATE menu_items 
SET nutritional_info = jsonb_build_object(
  'calories', 380,
  'protein', '35g',
  'fat', '22g'
)
FROM category_ids
WHERE category_id = category_ids.id;

-- Update image URLs to use Supabase storage URLs
UPDATE menu_items
SET image_url = CASE name
    WHEN 'Marqaa fi Anchootee' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/marqaa.jpg'
    WHEN 'Kurkuffaa' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/kurkuffa.jpg'
    WHEN 'Qincee' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/qincee.jpg'
    WHEN 'Caccabsaa' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/caccabsaa.jpg'
    WHEN 'Biddeena' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/biddena.jpg'
    WHEN 'Marmara' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/marmara.jpg'
    WHEN 'Qorii' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/qorii.jpg'
    WHEN 'Waaddii' THEN 'https://lwnytmdprmxhnpgaqkaq.supabase.co/storage/v1/object/public/menu-images/waadii.jpg'
    ELSE image_url
END; 