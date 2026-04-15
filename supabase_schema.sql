-- Tabela de Equipamentos
CREATE TABLE IF NOT EXISTS equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  patrimonio TEXT UNIQUE NOT NULL,
  serie TEXT,
  status TEXT NOT NULL DEFAULT 'Disponível',
  responsavel TEXT,
  localizacao TEXT,
  data_compra DATE,
  garantia DATE,
  specs TEXT,
  marca TEXT,
  modelo TEXT,
  processador TEXT,
  ram TEXT,
  armazenamento TEXT,
  so TEXT,
  valor TEXT,
  observacoes TEXT,
  foto TEXT,
  polegadas TEXT,
  resolucao TEXT,
  voltagem TEXT,
  numero_telefone TEXT,
  capacidade_bateria TEXT,
  imei TEXT
);

-- Tabela de Eventos/Logs
CREATE TABLE IF NOT EXISTS equipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  equip_id UUID REFERENCES equipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_events ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples para acesso público (ajuste conforme necessário para produção)
CREATE POLICY "Acesso público leitura" ON equipments FOR SELECT USING (true);
CREATE POLICY "Acesso público escrita" ON equipments FOR ALL USING (true);

CREATE POLICY "Acesso público leitura eventos" ON equipment_events FOR SELECT USING (true);
CREATE POLICY "Acesso público escrita eventos" ON equipment_events FOR ALL USING (true);

-- Dados Iniciais (Opcional)
INSERT INTO equipments (nome, tipo, patrimonio, serie, status, responsavel, localizacao, data_compra, garantia, specs, marca, modelo, processador, ram, armazenamento, so, valor)
VALUES 
('Dell Latitude 5420', 'Notebook', 'TI-001', 'ABC123XYZ', 'Em Uso', 'João Silva', 'TI - Sede', '2023-01-15', '2026-01-15', 'i7-1165G7, 16GB RAM, 512GB SSD', 'Dell', 'Latitude 5420', 'i7-1165G7', '16GB', '512GB SSD', 'Windows 11 Pro', '7500'),
('HP ProDesk 600', 'Desktop', 'TI-002', 'HP998877', 'Disponível', 'Estoque', 'Almoxarifado', '2022-11-20', '2024-11-20', 'i5-12400, 8GB RAM, 256GB SSD', 'HP', 'ProDesk 600 G6', 'i5-12400', '8GB', '256GB SSD', 'Windows 10 Pro', '4200');
