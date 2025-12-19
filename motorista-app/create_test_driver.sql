-- Criar motorista de teste para o app mobile
INSERT INTO drivers (name, cpf, cnh_number, cnh_expiry_date, password)
VALUES (
  'João Silva',
  '07966147402',
  '12345678901',
  '2026-12-31',
  '123456'
);

-- Vincular veículos ao motorista (atualizar com o ID gerado)
-- Primeiro pegue o ID do motorista criado:
-- SELECT id FROM drivers WHERE cpf = '07966147402';

-- Depois atualize os veículos (substitua <driver_id> pelo ID obtido):
-- UPDATE vehicles SET default_driver_id = '<driver_id>' 
-- WHERE plate IN ('RH15C17', 'TEX2I81');
