-- Tabela para definir itens do checklist
CREATE TABLE IF NOT EXISTS checklist_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('MAINTENANCE', 'LOADING')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (opcional, por enquanto desabilitado para facilitar)
ALTER TABLE checklist_definitions DISABLE ROW LEVEL SECURITY;

-- Popula com os itens atuais (Manutenção)
INSERT INTO checklist_definitions (name, type) VALUES
('Pneus dianteiros', 'MAINTENANCE'),
('Pneus traseiros', 'MAINTENANCE'),
('Freios', 'MAINTENANCE'),
('Luzes frontais', 'MAINTENANCE'),
('Luzes traseiras', 'MAINTENANCE'),
('Nível de óleo', 'MAINTENANCE'),
('Nível de água', 'MAINTENANCE'),
('Bateria', 'MAINTENANCE'),
('Suspensão', 'MAINTENANCE'),
('Espelhos retrovisores', 'MAINTENANCE'),
('Limpadores de para-brisa', 'MAINTENANCE'),
('Buzina', 'MAINTENANCE'),
('Extintor', 'MAINTENANCE'),
('Triângulo', 'MAINTENANCE'),
('Documentação', 'MAINTENANCE');

-- Popula com os itens atuais (Carga)
INSERT INTO checklist_definitions (name, type) VALUES
('Amarração da carga', 'LOADING'),
('Lonas', 'LOADING'),
('Separação de produtos', 'LOADING'),
('Lacres', 'LOADING'),
('Sinalização', 'LOADING'),
('Peso distribuído', 'LOADING'),
('Proteção lateral', 'LOADING'),
('Proteção traseira', 'LOADING');
