-- SQL SIMPLES PARA CRIAR MOTORISTA DE TESTE

-- 1. Adicionar colunas faltantes
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Criar motorista simples (sem data de validade CNH nesse momento)
INSERT INTO drivers (name, cpf, cnh_number, password)
VALUES ('João Silva', '07966147402', '12345678901', '123456')
RETURNING *;
