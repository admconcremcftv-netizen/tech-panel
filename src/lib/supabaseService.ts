import { supabase, isSupabaseConfigured } from './supabase';
import { Equipment, EquipmentEvent } from './types';

let runtimeOffline = false;
let runtimeOfflineReported = false;

const shouldUseMock = () => !isSupabaseConfigured || runtimeOffline;

const markOfflineIfNetworkError = (error: unknown) => {
  const msg = error instanceof Error ? error.message : String(error || '');
  const normalized = msg.toLowerCase();
  const isNetwork =
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('err_connection_closed') ||
    normalized.includes('err_name_not_resolved') ||
    normalized.includes('load failed');

  if (!isNetwork) return;

  runtimeOffline = true;
  if (!runtimeOfflineReported) {
    runtimeOfflineReported = true;
    console.warn('Supabase indisponível (rede). Alternando para modo OFFLINE.');
  }
};

const MOCK_EQUIPMENTS: Equipment[] = [
  {
    id: '1',
    nome: 'MODO OFFLINE - Dell Latitude 5420',
    tipo: 'Notebook',
    patrimonio: 'TI-001',
    serie: 'ABC123XYZ',
    status: 'Em Uso',
    responsavel: 'João Silva',
    localizacao: 'TI - Sede',
    dataCompra: '2023-01-15',
    garantia: '2026-01-15',
    specs: 'i7-1165G7, 16GB RAM, 512GB SSD',
    marca: 'Dell',
    modelo: 'Latitude 5420',
    processador: 'i7-1165G7',
    ram: '16GB',
    armazenamento: '512GB SSD',
    so: 'Windows 11 Pro',
    valor: '7500',
    observacoes: 'Notebook principal do desenvolvedor',
    foto: null
  },
  {
    id: '2',
    nome: 'HP ProDesk 600',
    tipo: 'Desktop',
    patrimonio: 'TI-002',
    serie: 'HP998877',
    status: 'Disponível',
    responsavel: 'Estoque',
    localizacao: 'Almoxarifado',
    dataCompra: '2022-11-20',
    garantia: '2024-11-20',
    specs: 'i5-12400, 8GB RAM, 256GB SSD',
    marca: 'HP',
    modelo: 'ProDesk 600 G6',
    processador: 'i5-12400',
    ram: '8GB',
    armazenamento: '256GB SSD',
    so: 'Windows 10 Pro',
    valor: '4200',
    observacoes: '',
    foto: null
  },
  {
    id: '3',
    nome: 'MacBook Air M2',
    tipo: 'Notebook',
    patrimonio: 'TI-003',
    serie: 'APPLE-M2-99',
    status: 'Em Manutenção',
    responsavel: 'Maria Oliveira',
    localizacao: 'Assistência Técnica',
    dataCompra: '2023-05-10',
    garantia: '2024-05-10',
    specs: 'Apple M2, 8GB RAM, 256GB SSD',
    marca: 'Apple',
    modelo: 'MacBook Air M2',
    processador: 'Apple M2',
    ram: '8GB',
    armazenamento: '256GB SSD',
    so: 'macOS Sonoma',
    valor: '9500',
    observacoes: 'Tela trincada',
    foto: null
  }
];

const MOCK_EVENTS: EquipmentEvent[] = [
  { id: 'e1', equipId: '1', type: 'Cadastro', desc: 'Ativo registrado no sistema', date: '2023-01-15' },
  { id: 'e2', equipId: '1', type: 'Transferência', desc: 'Entregue para João Silva', date: '2023-01-16' },
  { id: 'e3', equipId: '3', type: 'Manutenção', desc: 'Enviado para reparo de tela', date: '2024-03-20' }
];

export const SupabaseService = {
  // Equipamentos
  async getEquipments(): Promise<Equipment[]> {
    if (shouldUseMock()) {
      // Retorna em ordem inversa para simular 'created_at desc'
      return [...MOCK_EQUIPMENTS].reverse();
    }
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        markOfflineIfNetworkError(error);
        if (runtimeOffline) return [...MOCK_EQUIPMENTS].reverse();
        console.error('Erro ao buscar equipamentos:', error);
        return [];
      }

      return (data || []).map(d => this.mapFromSupabase(d));
    } catch (err) {
      markOfflineIfNetworkError(err);
      if (runtimeOffline) return [...MOCK_EQUIPMENTS].reverse();
      console.error('Erro fatal ao buscar equipamentos:', err);
      return [];
    }
  },

  async getEquipment(id: string): Promise<Equipment | null> {
    if (shouldUseMock()) {
      return MOCK_EQUIPMENTS.find(e => e.id === id) || null;
    }
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        markOfflineIfNetworkError(error);
        if (runtimeOffline) return MOCK_EQUIPMENTS.find(e => e.id === id) || null;
        console.error('Erro ao buscar equipamento:', error);
        return null;
      }

      return this.mapFromSupabase(data);
    } catch (err) {
      markOfflineIfNetworkError(err);
      if (runtimeOffline) return MOCK_EQUIPMENTS.find(e => e.id === id) || null;
      console.error('Erro fatal ao buscar equipamento:', err);
      return null;
    }
  },

  async saveEquipment(eq: Omit<Equipment, 'id'>, id?: string): Promise<string | null> {
    if (shouldUseMock()) {
      if (id) {
        const index = MOCK_EQUIPMENTS.findIndex(e => e.id === id);
        if (index !== -1) {
          MOCK_EQUIPMENTS[index] = { ...eq, id } as Equipment;
          return id;
        }
        return null;
      } else {
        // Verificar se patrimônio já existe no mock
        if (MOCK_EQUIPMENTS.some(e => e.patrimonio === eq.patrimonio)) {
          throw new Error('Este patrimônio já está cadastrado.');
        }
        const newId = 'new-mock-id-' + Math.random().toString(36).substr(2, 9);
        const newEq = { ...eq, id: newId } as Equipment;
        MOCK_EQUIPMENTS.push(newEq);
        MOCK_EVENTS.push({
          id: 'ev-' + Math.random().toString(36).substr(2, 9),
          equipId: newId,
          type: 'Cadastro',
          desc: 'Ativo registrado no sistema',
          date: new Date().toISOString().split('T')[0]
        });
        return newId;
      }
    }
    try {
      const mapped = this.mapToSupabase(eq);

      if (id) {
        const { error } = await supabase
          .from('equipments')
          .update(mapped)
          .eq('id', id);

        if (error) {
          if (error.code === '23505') throw new Error('Este patrimônio já está cadastrado.');
          markOfflineIfNetworkError(error);
          if (runtimeOffline) return id || null;
          console.error('Erro ao atualizar equipamento:', error);
          return null;
        }
        return id;
      } else {
        const { data, error } = await supabase
          .from('equipments')
          .insert([mapped])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') throw new Error('Este patrimônio já está cadastrado.');
          markOfflineIfNetworkError(error);
          if (runtimeOffline) return null;
          console.error('Erro ao inserir equipamento:', error);
          return null;
        }
        
        const newId = data.id;
        await this.addEvent(newId, 'Cadastro', 'Ativo registrado no sistema');
        return newId;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Este patrimônio já está cadastrado.') throw err;
      markOfflineIfNetworkError(err);
      console.error('Erro fatal ao salvar equipamento:', err);
      return null;
    }
  },

  async deleteEquipment(id: string): Promise<boolean> {
    if (shouldUseMock()) {
      const index = MOCK_EQUIPMENTS.findIndex(e => e.id === id);
      if (index !== -1) {
        MOCK_EQUIPMENTS.splice(index, 1);
        return true;
      }
      return false;
    }
    try {
      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id);

      if (error) {
        markOfflineIfNetworkError(error);
        if (runtimeOffline) return false;
        console.error('Erro ao excluir equipamento:', error);
        return false;
      }
      return true;
    } catch (err) {
      markOfflineIfNetworkError(err);
      if (runtimeOffline) return false;
      console.error('Erro fatal ao excluir equipamento:', err);
      return false;
    }
  },

  // Eventos
  async getEvents(): Promise<EquipmentEvent[]> {
    if (shouldUseMock()) {
      return [...MOCK_EVENTS].reverse();
    }
    try {
      const { data, error } = await supabase
        .from('equipment_events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        markOfflineIfNetworkError(error);
        if (runtimeOffline) return [...MOCK_EVENTS].reverse();
        console.error('Erro ao buscar eventos:', error);
        return [];
      }

      return (data || []).map(ev => ({
        id: ev.id,
        equipId: ev.equip_id,
        type: ev.type,
        desc: ev.description,
        date: ev.date
      }));
    } catch (err) {
      markOfflineIfNetworkError(err);
      if (runtimeOffline) return [...MOCK_EVENTS].reverse();
      console.error('Erro fatal ao buscar eventos:', err);
      return [];
    }
  },

  async getEquipmentEvents(equipId: string): Promise<EquipmentEvent[]> {
    if (shouldUseMock()) {
      return MOCK_EVENTS.filter(e => e.equipId === equipId).reverse();
    }
    try {
      const { data, error } = await supabase
        .from('equipment_events')
        .select('*')
        .eq('equip_id', equipId)
        .order('date', { ascending: false });

      if (error) {
        markOfflineIfNetworkError(error);
        if (runtimeOffline) return MOCK_EVENTS.filter(e => e.equipId === equipId).reverse();
        console.error('Erro ao buscar eventos do equipamento:', error);
        return [];
      }

      return (data || []).map(ev => ({
        id: ev.id,
        equipId: ev.equip_id,
        type: ev.type,
        desc: ev.description,
        date: ev.date
      }));
    } catch (err) {
      markOfflineIfNetworkError(err);
      if (runtimeOffline) return MOCK_EVENTS.filter(e => e.equipId === equipId).reverse();
      console.error('Erro fatal ao buscar eventos do equipamento:', err);
      return [];
    }
  },

  async addEvent(equipId: string, type: string, desc: string, date?: string) {
    if (shouldUseMock()) {
      MOCK_EVENTS.push({
        id: 'ev-' + Math.random().toString(36).substr(2, 9),
        equipId,
        type,
        desc,
        date: date || new Date().toISOString().split('T')[0]
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('equipment_events')
        .insert([{
          equip_id: equipId,
          type,
          description: desc,
          date: date || new Date().toISOString().split('T')[0]
        }]);

      if (error) {
        markOfflineIfNetworkError(error);
        console.error('Erro ao adicionar evento:', error);
      }
    } catch (err) {
      markOfflineIfNetworkError(err);
      console.error('Erro fatal ao adicionar evento:', err);
    }
  },

  // Mapeadores
  mapToSupabase(eq: Partial<Equipment>) {
    return {
      nome: eq.nome,
      tipo: eq.tipo,
      patrimonio: eq.patrimonio,
      serie: eq.serie,
      status: eq.status,
      responsavel: eq.responsavel,
      localizacao: eq.localizacao,
      data_compra: eq.dataCompra || null,
      garantia: eq.garantia || null,
      specs: eq.specs,
      marca: eq.marca,
      modelo: eq.modelo,
      processador: eq.processador,
      ram: eq.ram,
      armazenamento: eq.armazenamento,
      so: eq.so,
      valor: eq.valor,
      observacoes: eq.observacoes,
      foto: eq.foto,
      polegadas: eq.polegadas,
      resolucao: eq.resolucao,
      voltagem: eq.voltagem,
      numero_telefone: eq.numeroTelefone,
      capacidade_bateria: eq.capacidadeBateria,
      imei: eq.imei
    };
  },

  mapFromSupabase(data: unknown): Equipment {
    const row = (data ?? {}) as Record<string, unknown>;
    const str = (key: string) => (typeof row[key] === 'string' ? (row[key] as string) : '');
    return {
      id: str('id'),
      nome: str('nome'),
      tipo: str('tipo') || 'Notebook',
      patrimonio: str('patrimonio'),
      serie: str('serie'),
      status: (str('status') as Equipment['status']) || 'Disponível',
      responsavel: str('responsavel'),
      localizacao: str('localizacao'),
      dataCompra: str('data_compra'),
      garantia: str('garantia'),
      specs: str('specs'),
      marca: str('marca'),
      modelo: str('modelo'),
      processador: str('processador'),
      ram: str('ram'),
      armazenamento: str('armazenamento'),
      so: str('so'),
      valor: str('valor'),
      observacoes: str('observacoes'),
      foto: typeof row['foto'] === 'string' ? (row['foto'] as string) : null,
      polegadas: str('polegadas'),
      resolucao: str('resolucao'),
      voltagem: str('voltagem'),
      numeroTelefone: str('numero_telefone'),
      capacidadeBateria: str('capacidade_bateria'),
      imei: str('imei')
    };
  }
};
