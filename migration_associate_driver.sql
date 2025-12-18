-- RODE ESTE SCRIPT NO SUPABASE SQL EDITOR

-- Adicionar coluna de motorista padrão na tabela de veículos
alter table vehicles 
add column if not exists default_driver_id uuid references drivers(id) null;

-- Atualizar política (se necessário, mas a política de 'update' já cobre)
-- Apenas para garantir que o cache do Supabase entenda a mudança
comment on column vehicles.default_driver_id is 'Link to the default driver for this vehicle';
