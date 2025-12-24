-- Enable storage extension if not already enabled (standard in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the bucket for transaction attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-attachments', 'transaction-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'transaction-attachments' );

-- Policy: Allow authenticated users to View files
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'transaction-attachments' );

-- Policy: Allow authenticated users to Delete files (their own ideally, but for now authenticated)
CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'transaction-attachments' );
