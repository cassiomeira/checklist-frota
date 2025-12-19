-- Adicionar colunas para categorização e escopo de veículo
ALTER TABLE checklist_definitions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';
ALTER TABLE checklist_definitions ADD COLUMN IF NOT EXISTS vehicle_scope TEXT DEFAULT 'ALL';

-- Limpar dados antigos para reinserir com a estrutura correta (JÁ QUE AINDA NÃO ESTÁ EM PRODUÇÃO PREENCHIDA PELO USUÁRIO)
TRUNCATE TABLE checklist_definitions;

-- =============================================
-- ITENS DE MANUTENÇÃO - COMUM (ALL) ou TRUCK
-- =============================================

-- Documentação & Segurança (Comum ou Truck?) Geralmente Truck carrega os docs principais
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Documentos (CRLV, CNH, Seguros)', 'MAINTENANCE', 'Documentação & Segurança', 'TRUCK'),
('Extintor de Incêndio (Validade/Lacre)', 'MAINTENANCE', 'Documentação & Segurança', 'TRUCK'),
('Triângulo, Macaco e Chave de Roda', 'MAINTENANCE', 'Documentação & Segurança', 'TRUCK'),
('EPIs (Colete, Capacete, Botas)', 'MAINTENANCE', 'Documentação & Segurança', 'TRUCK');

-- Cabine & Painel (Apenas Truck/Cavalo)
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Luzes do Painel (Avisos/Falhas)', 'MAINTENANCE', 'Cabine & Painel', 'TRUCK'),
('Nível de Combustível', 'MAINTENANCE', 'Cabine & Painel', 'TRUCK'),
('Nível de Arla 32', 'MAINTENANCE', 'Cabine & Painel', 'TRUCK'),
('Cronotacógrafo (Funcionamento/Disco/Fita)', 'MAINTENANCE', 'Cabine & Painel', 'TRUCK'),
('Ar Condicionado e Limpadores', 'MAINTENANCE', 'Cabine & Painel', 'TRUCK'),
('Retrovisores (Ajuste/Estado)', 'MAINTENANCE', 'Cabine & Painel', 'TRUCK');

-- Externa & Mecânica (Apenas Truck)
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Iluminação (Faróis, Setas, Freio, Ré)', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK'),
('Pneus (Calibragem, Sulcos, Parafusos)', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK'),
('Nível de Óleo do Motor', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK'),
('Líquido de Arrefecimento', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK'),
('Vazamentos Visíveis (Água/Óleo/Ar)', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK'),
('Bolsas de Ar da Suspensão', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK'),
('Quinta Roda (Travamento)', 'MAINTENANCE', 'Externa & Mecânica', 'TRUCK');

-- =============================================
-- ITENS DE MANUTENÇÃO - TRAILER (CARRETA)
-- =============================================

-- Estrutura & Segurança
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Documentação da Carreta', 'MAINTENANCE', 'Estrutura & Segurança', 'TRAILER'),
('Faixas Refletivas e Placas', 'MAINTENANCE', 'Estrutura & Segurança', 'TRAILER'),
('Para-choque Traseiro', 'MAINTENANCE', 'Estrutura & Segurança', 'TRAILER'),
('Aparabarros', 'MAINTENANCE', 'Estrutura & Segurança', 'TRAILER');

-- Pneus & Suspensão
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Pneus (Estado/Pressão/Estepe)', 'MAINTENANCE', 'Pneus & Suspensão', 'TRAILER'),
('Bolsas de Ar / Molas', 'MAINTENANCE', 'Pneus & Suspensão', 'TRAILER'),
('Freios (Lonas/Tambores/Cuícas)', 'MAINTENANCE', 'Pneus & Suspensão', 'TRAILER'),
('Cubos de Roda (Vazamentos)', 'MAINTENANCE', 'Pneus & Suspensão', 'TRAILER');

-- Conexões & Carga
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Mangueiras de Ar e Cabos Elétricos (ABS)', 'MAINTENANCE', 'Conexões & Carga', 'TRAILER'),
('Pés de Apoio (Funcionamento)', 'MAINTENANCE', 'Conexões & Carga', 'TRAILER'),
('Assoalho, Lonas e Amarração de Carga', 'MAINTENANCE', 'Conexões & Carga', 'TRAILER'),
('Portas Traseiras e Travas', 'MAINTENANCE', 'Conexões & Carga', 'TRAILER');

-- =============================================
-- ITENS DE CARREGAMENTO (LOADING) - Geralmente aplica-se ao conjunto ou contexto da carga
-- Vamos definir scope ALL para simplificar, ou ajustar conforme necessidade.
-- =============================================

-- Documentação & Motorista
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Crachá de Identificação', 'LOADING', 'Documentação & Motorista', 'ALL'),
('CNH (Porte/Validade/Categoria)', 'LOADING', 'Documentação & Motorista', 'ALL'),
('Registro do IEF (Validade)', 'LOADING', 'Documentação & Motorista', 'ALL'),
('Laudo de Descaracterização', 'LOADING', 'Documentação & Motorista', 'ALL'),
('CRLV do Ano Vigente', 'LOADING', 'Documentação & Motorista', 'ALL'),
('Extrato da ANTT (Placa Cavalo/Carreta)', 'LOADING', 'Documentação & Motorista', 'ALL'),
('Cadastro Técnico Federal (IBAMA)', 'LOADING', 'Documentação & Motorista', 'ALL'),
('EPIs (Loading)', 'LOADING', 'Documentação & Motorista', 'ALL');

-- Segurança Veicular
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Cinto de Segurança', 'LOADING', 'Segurança Veicular', 'ALL'),
('Pneus / Estepe (Estado/Avarias)', 'LOADING', 'Segurança Veicular', 'ALL'),
('Faróis / Lanternas / Sinal Sonoro Ré', 'LOADING', 'Segurança Veicular', 'ALL'),
('Kit Emergência (Extintor, Cones, Ferramentas)', 'LOADING', 'Segurança Veicular', 'ALL');

-- Compartimento de Carga
INSERT INTO checklist_definitions (name, type, category, vehicle_scope) VALUES
('Lona de Cobertura (Sem furos/Estado)', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Cabo Travamento Lona / Suporte Lacre', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Estrutura da Carreta (Assoalho/Arcos sem danos)', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Limpeza (Materiais estranhos/Resto de carvão)', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Finos em Excesso', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Água / Umidade', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Borrachões / Calhas Metálicas', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Cintas (Estado das 3 cintas)', 'LOADING', 'Compartimento de Carga', 'ALL'),
('Cordas para Fixar Lona (Dianteira/Traseira)', 'LOADING', 'Compartimento de Carga', 'ALL');
