export interface Equipment {
  id: string;
  nome: string;
  tipo: string;
  patrimonio: string;
  serie: string;
  status: 'Disponível' | 'Em Uso' | 'Em Manutenção' | 'Descartado';
  responsavel: string;
  localizacao: string;
  dataCompra: string;
  garantia: string;
  specs: string;
  marca: string;
  modelo: string;
  processador: string;
  ram: string;
  armazenamento: string;
  so: string;
  valor: string;
  observacoes: string;
  foto: string | null;
}

export interface EquipmentEvent {
  id: string;
  equipId: string;
  type: string;
  desc: string;
  date: string;
}

export type EquipmentStatus = Equipment['status'];
