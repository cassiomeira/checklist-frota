-- ETAPA 1: Adicionar coluna password
ALTER TABLE drivers ADD COLUMN password TEXT;

-- ETAPA 2: Atualizar motorista existente com senha
UPDATE drivers 
SET password = '123456' 
WHERE cpf = '07965147302';

-- ETAPA 3: Ou criar novo motorista João Silva
INSERT INTO drivers (name, cpf, cnh_number, cnh_expiry_date, password)
VALUES ('João Silva', '07966147402', '12345678901', '2026-12-31', '123456');
