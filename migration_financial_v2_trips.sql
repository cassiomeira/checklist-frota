-- Create TRIPS table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL, -- Driver might be deleted, but trip remains
    
    start_location TEXT NOT NULL,
    end_location TEXT, -- Nullable initially (while in progress)
    
    start_km INTEGER NOT NULL,
    end_km INTEGER, -- Nullable initially
    
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Financials
    freight_amount DECIMAL(10, 2) DEFAULT 0, -- Valor do Frete (Receita)
    extra_expenses_amount DECIMAL(10, 2) DEFAULT 0, -- Gastos Extras (Pedágio, Chapa, etc)
    fuel_amount DECIMAL(10, 2) DEFAULT 0, -- Custo Combustivel (Manual ou Calculado)
    commission_amount DECIMAL(10, 2) DEFAULT 0, -- Valor da Comissão
    
    status TEXT CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELED')) DEFAULT 'IN_PROGRESS',
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their tenant trips" ON trips
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update trips" ON trips
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete trips" ON trips
    FOR DELETE USING (auth.uid() = created_by);

-- Updated_at trigger
CREATE TRIGGER update_trips_modtime
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Add trip_id to transactions for linking
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE SET NULL;
