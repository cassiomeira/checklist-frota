-- Migration: Add attachment_url to transactions
-- Description: Adds a column to store the Base64 string or URL of the attachment (receipt/invoice).

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Create an index just in case we need to filter empty attachments later (optional but good practice)
-- CREATE INDEX IF NOT EXISTS idx_transactions_attachment_url ON transactions(attachment_url);
