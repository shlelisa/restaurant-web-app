-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public Read"
ON settings FOR SELECT
USING (true);

CREATE POLICY "Admin Insert"
ON settings FOR INSERT
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admin Update"
ON settings FOR UPDATE
USING (auth.role() = 'admin');

CREATE POLICY "Admin Delete"
ON settings FOR DELETE
USING (auth.role() = 'admin'); 