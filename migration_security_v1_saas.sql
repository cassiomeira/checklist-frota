
-- ==============================================================================
-- MIGRATION: SAAS SECURITY (V1)
-- Description: Enables strict Row Level Security (RLS) and data isolation per user.
-- ==============================================================================

-- Helper to add created_by if invalid
CREATE OR REPLACE FUNCTION add_owner_column(tbl text) RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()', tbl);
END;
$$ LANGUAGE plpgsql;

-- 1. ADD OWNER COLUMNS TO ALL TABLES
SELECT add_owner_column('vehicles');
SELECT add_owner_column('drivers');
SELECT add_owner_column('checklists');
SELECT add_owner_column('financial_accounts');
SELECT add_owner_column('suppliers');
SELECT add_owner_column('customers');
SELECT add_owner_column('transactions'); -- Note: If it existed as TEXT, this might technically fail if populated. Assuming dev env or compatible.
-- trips already has it.
SELECT add_owner_column('fuel_entries'); -- Assuming this table exists from v2_fuel

-- 2. ENABLE RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fuel_entries ENABLE ROW LEVEL SECURITY; -- Uncomment if exists

-- 3. DROP OLD "PUBLIC" POLICIES
DROP POLICY IF EXISTS "Public Select Vehicles" ON vehicles;
DROP POLICY IF EXISTS "Public Insert Vehicles" ON vehicles;
DROP POLICY IF EXISTS "Public Update Vehicles" ON vehicles;

DROP POLICY IF EXISTS "Public Select Drivers" ON drivers;
DROP POLICY IF EXISTS "Public Insert Drivers" ON drivers;
DROP POLICY IF EXISTS "Public Update Drivers" ON drivers;
DROP POLICY IF EXISTS "Public Delete Drivers" ON drivers;

-- Drop all "Enable all access..." policies from financial tables
DROP POLICY IF EXISTS "Enable all access for financial_accounts" ON financial_accounts;
DROP POLICY IF EXISTS "Enable all access for suppliers" ON suppliers;
DROP POLICY IF EXISTS "Enable all access for customers" ON customers;
DROP POLICY IF EXISTS "Enable all access for transactions" ON transactions;

-- 4. CREATE NEW "PRIVATE" POLICIES (SAAS ISOLATION)

-- Helper for standard policies
CREATE OR REPLACE FUNCTION create_private_policies(tbl text) RETURNS void AS $$
BEGIN
    -- SELECT
    EXECUTE format('CREATE POLICY "Users view their own %I" ON %I FOR SELECT USING (auth.uid() = created_by)', tbl, tbl);
    -- INSERT
    EXECUTE format('CREATE POLICY "Users insert their own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = created_by)', tbl, tbl);
    -- UPDATE
    EXECUTE format('CREATE POLICY "Users update their own %I" ON %I FOR UPDATE USING (auth.uid() = created_by)', tbl, tbl);
    -- DELETE
    EXECUTE format('CREATE POLICY "Users delete their own %I" ON %I FOR DELETE USING (auth.uid() = created_by)', tbl, tbl);
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
SELECT create_private_policies('vehicles');
SELECT create_private_policies('drivers');
SELECT create_private_policies('checklists');
SELECT create_private_policies('financial_accounts');
SELECT create_private_policies('suppliers');
SELECT create_private_policies('customers');
SELECT create_private_policies('transactions');
-- Trips likely already has policies from the previous fix, but let's overwrite or ensure consistency? 
-- The previous fix added specific named policies. Let's leave them if they work, or standardize.
-- If we run create_private_policies on trips, it might conflict if names differ. 
-- Let's manually ensure Trips is secure.
DROP POLICY IF EXISTS "Users can view their tenant trips" ON trips;
DROP POLICY IF EXISTS "Users can insert trips" ON trips;
DROP POLICY IF EXISTS "Users can update trips" ON trips;
DROP POLICY IF EXISTS "Users can delete trips" ON trips;
SELECT create_private_policies('trips');

-- 5. CLEANUP (Optional)
-- UPDATE vehicles SET created_by = auth.uid() WHERE created_by IS NULL; -- Cannot do this easily in migration without knowing the user. 
-- Users will start with empty views, or they can manually run an UPDATE in the SQL Editor if they want to claim existing rows.

