-- Enable RLS (if not enabled, just to be sure we are controlling it, or disable it if we want open access)
-- For simplicity in this development phase, let's DISABLE RLS on drivers or add a policy.

-- Option A: Disable RLS (Easiest for testing)
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;

-- Option B: If you prefer to keep RLS, allow public read:
-- CREATE POLICY "Allow public read access" ON drivers FOR SELECT USING (true);
