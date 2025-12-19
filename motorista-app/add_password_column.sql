-- PASSO 1: Adicionar coluna password (se não existir)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS password TEXT;

-- PASSO 2: Criar motorista (SEM especificar o ID, deixa o Postgres gerar)
INSERT INTO drivers (name, cpf, cnh_number, cnh_expiry_date, password)
VALUES (
  'João Silva',
  '07966147402',
  '12345678901',
  '2026-12-31',
  '123456'
)
RETURNING *;
