-- Verificar se o motorista foi criado corretamente
SELECT * FROM drivers WHERE cnh_number = '12345678901';

-- Verificar se a coluna CPF existe e tem valor
SELECT name, cpf, password FROM drivers;
