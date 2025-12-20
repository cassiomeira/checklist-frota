-- ==============================================================================
-- MIGRATION: FINANCIAL V5 - UPDATE CUSTOMERS TABLE
-- Description: Updates customers table to match suppliers structure (trade_name, legal_name).
-- ==============================================================================

-- Rename name to trade_name
ALTER TABLE customers RENAME COLUMN name TO trade_name;

-- Add legal_name column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS legal_name text;

-- Update RLS policies just in case (though they use 'true' so it's fine)
-- No change needed for policies as they are 'for all using (true)'
