import { Equipment, EquipmentEvent } from './types';

const KEYS = {
  equipments: 'ct_equipments',
  events: 'ct_events',
};

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function seed() {
  const equipments: Equipment[] = [
    {
      id: 'eq-1', nome: 'Dell Latitude 5420', tipo: 'Notebook', patrimonio: 'TI-001',
      serie: 'ABC123XYZ', status: 'Em Uso', responsavel: 'João Silva',
      localizacao: 'TI - Sede', dataCompra: '2023-01-15', garantia: '2026-01-15',
      specs: 'i7-1165G7, 16GB RAM, 512GB SSD', marca: 'Dell', modelo: 'Latitude 5420',
      processador: 'i7-1165G7', ram: '16GB', armazenamento: '512GB SSD', so: 'Windows 11 Pro',
      valor: '7500', observacoes: '', foto: null,
    },
    {
      id: 'eq-2', nome: 'HP ProDesk 600', tipo: 'Desktop', patrimonio: 'TI-002',
      serie: 'HP998877', status: 'Disponível', responsavel: 'Estoque',
      localizacao: 'Almoxarifado', dataCompra: '2022-11-20', garantia: '2024-11-20',
      specs: 'i5-12400, 8GB RAM, 256GB SSD', marca: 'HP', modelo: 'ProDesk 600 G6',
      processador: 'i5-12400', ram: '8GB', armazenamento: '256GB SSD', so: 'Windows 10 Pro',
      valor: '4200', observacoes: '', foto: null,
    },
    {
      id: 'eq-3', nome: 'Brother HL-L2370DW', tipo: 'Impressora', patrimonio: 'TI-003',
      serie: 'BR12345', status: 'Em Manutenção', responsavel: 'Suporte',
      localizacao: 'Lab Técnica', dataCompra: '2021-05-10', garantia: '2022-05-10',
      specs: 'Laser Mono, Wi-Fi, Duplex', marca: 'Brother', modelo: 'HL-L2370DW',
      processador: 'N/A', ram: 'N/A', armazenamento: 'N/A', so: 'Firmware Brother',
      valor: '1200', observacoes: 'Papel atolando frequentemente', foto: null,
      voltagem: '110v',
    },
    {
      id: 'eq-4', nome: 'LG UltraWide 29WN600', tipo: 'Monitor', patrimonio: 'TI-004',
      serie: 'LG44556', status: 'Disponível', responsavel: 'Estoque',
      localizacao: 'Almoxarifado', dataCompra: '2023-06-01', garantia: '2026-06-01',
      specs: '29" IPS, 2560x1080, 75Hz', marca: 'LG', modelo: 'UltraWide 29WN600',
      processador: 'N/A', ram: 'N/A', armazenamento: 'N/A', so: 'N/A',
      valor: '1800', observacoes: '', foto: null,
      polegadas: '29"', resolucao: '2560x1080', voltagem: 'Bivolt',
    },
    {
      id: 'eq-5', nome: 'Lenovo ThinkPad T480', tipo: 'Notebook', patrimonio: 'TI-005',
      serie: 'LNV77889', status: 'Descartado', responsavel: 'Descarte',
      localizacao: 'Depósito', dataCompra: '2018-03-22', garantia: '2021-03-22',
      specs: 'i5-8250U, 8GB RAM, 256GB SSD', marca: 'Lenovo', modelo: 'ThinkPad T480',
      processador: 'i5-8250U', ram: '8GB', armazenamento: '256GB SSD', so: 'Windows 10 Pro',
      valor: '5200', observacoes: 'Equipamento obsoleto, bateria não segura carga', foto: null,
    },
  ];

  const events: EquipmentEvent[] = [
    { id: 'ev-1', equipId: 'eq-1', type: 'Cadastro', desc: 'Ativo registrado no sistema', date: '2023-01-15' },
    { id: 'ev-2', equipId: 'eq-1', type: 'Transferência', desc: 'Atribuído ao João Silva - TI Sede', date: '2023-01-16' },
    { id: 'ev-3', equipId: 'eq-2', type: 'Cadastro', desc: 'Ativo registrado no sistema', date: '2022-11-20' },
    { id: 'ev-4', equipId: 'eq-2', type: 'Transferência', desc: 'Movido para estoque - Almoxarifado', date: '2022-11-21' },
    { id: 'ev-5', equipId: 'eq-3', type: 'Cadastro', desc: 'Ativo registrado no sistema', date: '2021-05-10' },
    { id: 'ev-6', equipId: 'eq-3', type: 'Manutenção', desc: 'Papel atolado e barulho no fusor', date: '2026-03-01' },
    { id: 'ev-7', equipId: 'eq-4', type: 'Cadastro', desc: 'Ativo registrado no sistema', date: '2023-06-01' },
    { id: 'ev-8', equipId: 'eq-5', type: 'Cadastro', desc: 'Ativo registrado no sistema', date: '2018-03-22' },
    { id: 'ev-9', equipId: 'eq-5', type: 'Manutenção', desc: 'Bateria não segura carga, placa com oxidação', date: '2024-01-10' },
    { id: 'ev-10', equipId: 'eq-5', type: 'Descarte', desc: 'Equipamento descartado por obsolescência', date: '2024-02-15' },
  ];

  localStorage.setItem(KEYS.equipments, JSON.stringify(equipments));
  localStorage.setItem(KEYS.events, JSON.stringify(events));
}

export const Storage = {
  init() {
    if (!localStorage.getItem(KEYS.equipments)) {
      seed();
    }
  },

  getEquipments(): Equipment[] {
    return JSON.parse(localStorage.getItem(KEYS.equipments) || '[]');
  },

  saveEquipments(data: Equipment[]) {
    localStorage.setItem(KEYS.equipments, JSON.stringify(data));
  },

  getEquipment(id: string): Equipment | undefined {
    return this.getEquipments().find(e => e.id === id);
  },

  saveEquipment(eq: Omit<Equipment, 'id'>, id?: string): string {
    const all = this.getEquipments();
    if (id) {
      const updated = all.map(item => item.id === id ? { ...item, ...eq } : item);
      this.saveEquipments(updated);
      return id;
    } else {
      const newId = generateId('eq');
      all.push({ id: newId, ...eq } as Equipment);
      this.saveEquipments(all);
      this.addEvent(newId, 'Cadastro', 'Ativo registrado no sistema');
      return newId;
    }
  },

  deleteEquipment(id: string) {
    this.saveEquipments(this.getEquipments().filter(e => e.id !== id));
  },

  getEvents(): EquipmentEvent[] {
    return JSON.parse(localStorage.getItem(KEYS.events) || '[]');
  },

  getEquipmentEvents(equipId: string): EquipmentEvent[] {
    return this.getEvents().filter(ev => ev.equipId === equipId);
  },

  addEvent(equipId: string, type: string, desc: string, date?: string) {
    const events = this.getEvents();
    events.push({
      id: generateId('ev'),
      equipId,
      type,
      desc,
      date: date || new Date().toISOString().split('T')[0],
    });
    localStorage.setItem(KEYS.events, JSON.stringify(events));
  },
};

Storage.init();
