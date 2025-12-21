-- Add missing columns to drivers table to match the application Types
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS password text;

-- Ensure RLS is enabled and policies exist (just in case)
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Public Select Drivers') THEN
        CREATE POLICY "Public Select Drivers" ON drivers FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Public Insert Drivers') THEN
        CREATE POLICY "Public Insert Drivers" ON drivers FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Public Update Drivers') THEN
        CREATE POLICY "Public Update Drivers" ON drivers FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Public Delete Drivers') THEN
        CREATE POLICY "Public Delete Drivers" ON drivers FOR DELETE USING (true);
    END IF;
END $$;
