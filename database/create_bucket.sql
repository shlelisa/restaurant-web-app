-- Create storage bucket for menu images if not exists
INSERT INTO storage.buckets (id, name, public)
SELECT 'menu-images', 'menu-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'menu-images'
);

-- Create policy to allow public access to menu images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'menu-images' );

-- Create policy to allow authenticated users to insert images
CREATE POLICY "Allow Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'menu-images' );

-- Create policy to allow authenticated users to update images
CREATE POLICY "Allow Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'menu-images' );

-- Create policy to allow authenticated users to delete images
CREATE POLICY "Allow Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'menu-images' ); 