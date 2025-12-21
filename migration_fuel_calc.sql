-- Add fuel calculation columns to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS fuel_liters NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fuel_price NUMERIC DEFAULT 0;

-- Refresh schema cache if needed (handled by Supabase usually)
