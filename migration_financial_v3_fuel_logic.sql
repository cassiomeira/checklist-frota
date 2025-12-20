-- Update function to handle Status based on Account
CREATE OR REPLACE FUNCTION create_transaction_for_fuel()
RETURNS TRIGGER AS $$
DECLARE
    v_plate TEXT;
    v_new_tx_id UUID;
    v_status TEXT;
    v_pay_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get vehicle plate for description
    SELECT plate INTO v_plate FROM vehicles WHERE id = NEW.vehicle_id;

    -- Determine Status and Payment Date
    IF NEW.account_id IS NOT NULL THEN
        v_status := 'PAID';
        v_pay_date := NEW.date;
    ELSE
        v_status := 'PENDING';
        v_pay_date := NULL;
    END IF;

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
        v_status,     -- Updated logic
        NEW.date,     -- Due date is the fuel date
        v_pay_date,   -- Payment date is null if pending
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
    UPDATE fuel_entries SET transaction_id = v_new_tx_id WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
