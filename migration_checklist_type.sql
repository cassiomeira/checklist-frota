-- RODE ESTE SCRIPT NO SUPABASE SQL EDITOR

-- Adicionar coluna de tipo de checklist
alter table checklists 
add column if not exists type text default 'MAINTENANCE';

-- Comentário para documentação
comment on column checklists.type is 'Type of checklist: MAINTENANCE or LOADING';
