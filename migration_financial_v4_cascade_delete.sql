-- ==============================================================================
-- MIGRATION: FINANCIAL V4 - SYNC DELETE
-- Description: Ensures deleting a Fuel Entry deletes its Transaction, and vice-versa.
-- ==============================================================================

-- 1. Handle "Delete Transaction -> Delete Fuel Entry"
-- We change the Foreign Key on fuel_entries to CASCADE delete.
ALTER TABLE fuel_entries
DROP CONSTRAINT IF EXISTS fuel_entries_transaction_id_fkey;

ALTER TABLE fuel_entries
ADD CONSTRAINT fuel_entries_transaction_id_fkey
FOREIGN KEY (transaction_id)
REFERENCES transactions(id)
ON DELETE CASCADE;

-- 2. Handle "Delete Fuel Entry -> Delete Transaction"
-- We need a trigger because Transaction doesn't point to Fuel Entry with a Cascade FK.
CREATE OR REPLACE FUNCTION delete_transaction_on_fuel_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.transaction_id IS NOT NULL THEN
        DELETE FROM transactions WHERE id = OLD.transaction_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_fuel_transaction ON fuel_entries;
CREATE TRIGGER trigger_delete_fuel_transaction
    AFTER DELETE ON fuel_entries
    FOR EACH ROW
    EXECUTE FUNCTION delete_transaction_on_fuel_delete();
