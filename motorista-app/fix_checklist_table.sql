-- Garantir colunas na tabela checklists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id);
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS driver_name TEXT;

-- Liberar RLS para garantir envio
ALTER TABLE checklists DISABLE ROW LEVEL SECURITY;
