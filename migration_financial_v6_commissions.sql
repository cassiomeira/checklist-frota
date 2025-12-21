-- Migration V6: Add commission_value to transactions
-- Used to track the calculated commission for drivers on INCOME transactions

alter table transactions 
add column if not exists commission_value numeric default 0;

-- Index for performance if we query commissions often
create index if not exists idx_transactions_commission_value on transactions(commission_value);
