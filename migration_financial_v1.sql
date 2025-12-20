-- ==============================================================================
-- MIGRATION: FINANCIAL ERP MODULE (V1)
-- Description: Creates tables for Wallets, Suppliers, Customers, and Transactions.
-- ==============================================================================

-- 1. Financial Accounts (Carteiras / Bancos / Caixas)
create table if not exists financial_accounts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('BANK', 'CASH', 'WALLET', 'CREDIT_CARD')), -- Tipo da conta
  initial_balance numeric(10,2) default 0.00, -- Saldo inicial para calibração
  bank_name text, -- Opcional: Nome do banco (ex: Nubank, Bradesco)
  account_number text, -- Opcional
  agency text, -- Opcional
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Suppliers (Fornecedores)
create table if not exists suppliers (
  id uuid default gen_random_uuid() primary key,
  trade_name text not null, -- Nome Fantasia
  legal_name text, -- Razão Social
  document text, -- CNPJ ou CPF
  phone text,
  email text,
  address text,
  category text check (category in ('FUEL', 'MAINTENANCE', 'PARTS', 'SERVICE', 'INSURANCE', 'GENERAL')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Customers (Clientes)
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  document text, -- CNPJ ou CPF
  phone text,
  email text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Transactions (Livro Razão - Contas a Pagar e Receber)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  
  -- Core Info
  description text not null, -- Ex: "Abastecimento Posto X", "Frete Carga Soja"
  amount numeric(12,2) not null, -- Valor absoluto
  type text not null check (type in ('INCOME', 'EXPENSE')), -- Receita ou Despesa
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'CANCELLED')), 
  
  -- Dates
  due_date date not null, -- Data de Vencimento / Previsão
  payment_date date, -- Data que realmente pagou/recebeu (Null se Pendente)
  
  -- Method & Categorization
  category text not null, -- Ex: 'FUEL', 'MAINTENANCE', 'FREIGHT', 'SALARY', 'TAX', 'Administrative'
  payment_method text check (payment_method in ('PIX', 'BOLETO', 'CARD', 'CASH', 'TRANSFER')),
  
  -- Relationships (Links)
  account_id uuid references financial_accounts(id), -- De qual conta saiu/entrou (Obrigatório se Status = PAID)
  vehicle_id uuid references vehicles(id), -- Alocação de custo/receita por veículo (Importante!)
  supplier_id uuid references suppliers(id), -- Se for Despesa
  customer_id uuid references customers(id), -- Se for Receita
  checklist_id uuid references checklists(id), -- Link opcional com manutenção do checklist
  
  created_by text, -- Pode ser o ID do usuário auth.users
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text
);

-- Enable RLS (Security) - Opening access for now to simplify development, similar to previous tables
alter table financial_accounts enable row level security;
alter table suppliers enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;

-- Policies (Allow all for anon/authenticated for now, strictly for dev speed per user preference)
create policy "Enable all access for financial_accounts" on financial_accounts for all using (true) with check (true);
create policy "Enable all access for suppliers" on suppliers for all using (true) with check (true);
create policy "Enable all access for customers" on customers for all using (true) with check (true);
create policy "Enable all access for transactions" on transactions for all using (true) with check (true);

-- Indexes for performance
create index if not exists idx_transactions_vehicle_id on transactions(vehicle_id);
create index if not exists idx_transactions_account_id on transactions(account_id);
create index if not exists idx_transactions_status on transactions(status);
create index if not exists idx_transactions_due_date on transactions(due_date);
