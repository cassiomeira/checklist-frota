-- Add driver_id to transactions to allow linking payments to drivers (e.g. Salaries)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES drivers(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_driver_id ON transactions(driver_id);
