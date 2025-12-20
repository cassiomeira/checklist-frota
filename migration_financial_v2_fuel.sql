-- Create fuel_entries table
CREATE TABLE IF NOT EXISTS fuel_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL, -- Source of funds
    
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    liters DECIMAL(10, 2) NOT NULL,
    price_per_liter DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    mileage INTEGER NOT NULL,
    full_tank BOOLEAN DEFAULT TRUE,
    payment_method TEXT, -- 'PIX', 'CARD', etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fuel_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to fuel_entries" ON fuel_entries FOR ALL USING (true) WITH CHECK (true);

-- Function to Auto-Create Transaction
CREATE OR REPLACE FUNCTION create_transaction_for_fuel()
RETURNS TRIGGER AS $$
DECLARE
    v_plate TEXT;
    v_new_tx_id UUID;
BEGIN
    -- Get vehicle plate for description
    SELECT plate INTO v_plate FROM vehicles WHERE id = NEW.vehicle_id;

    -- Insert Transaction
    INSERT INTO transactions (
        description,
        amount,
        type,
        status,
        due_date,
        payment_date,
        category,
        vehicle_id,
        supplier_id,
        account_id,
        payment_method,
        created_by,
        notes
    ) VALUES (
        'Abastecimento ' || COALESCE(v_plate, '?'),
        NEW.total_cost,
        'EXPENSE',
        'PAID', -- Assume fuel log implies paid. Future: Allow pending.
        NEW.date,
        NEW.date,
        'FUEL',
        NEW.vehicle_id,
        NEW.supplier_id,
        NEW.account_id,
        NEW.payment_method,
        'SYSTEM',
        'Auto-generated from Fuel Entry'
    )
    RETURNING id INTO v_new_tx_id;

    -- Update Fuel Entry with Transaction ID
    -- We need to avoid recursion if the update fires a trigger (it won't here, but good practice)
    -- Actually, this is an AFTER INSERT trigger, so we can update the row.
    -- However, updating the row that caused the trigger can be tricky in some DBs, but valid in PG if careful.
    -- Better approach: Use BEFORE INSERT to set fields, but we need the Transaction ID, which implies the Tx needs to be created first?
    -- No, circular dependency. 
    -- Best approach: AFTER INSERT, create Tx, then UPDATE fuel_entries.
    
    UPDATE fuel_entries SET transaction_id = v_new_tx_id WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trigger_auto_fuel_transaction ON fuel_entries;
CREATE TRIGGER trigger_auto_fuel_transaction
    AFTER INSERT ON fuel_entries
    FOR EACH ROW
    EXECUTE FUNCTION create_transaction_for_fuel();
