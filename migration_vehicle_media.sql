-- Migration: Add document and photo storage to vehicles table
-- Purpose: Allow uploading and viewing vehicle documents and photos

-- Add document_url column for storing vehicle documentation (CRLV, etc)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS document_url TEXT;

-- Add photos column as JSONB array for storing multiple vehicle photo URLs
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

COMMENT ON COLUMN vehicles.document_url IS 'URL to vehicle documentation (CRLV, registration, etc)';
COMMENT ON COLUMN vehicles.photos IS 'Array of photo URLs showing the vehicle';
