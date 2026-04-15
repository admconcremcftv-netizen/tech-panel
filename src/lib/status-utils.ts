import { EquipmentStatus } from './types';

export function getStatusColor(status: EquipmentStatus) {
  switch (status) {
    case 'Disponível': return 'status-ok';
    case 'Em Uso': return 'status-info';
    case 'Em Manutenção': return 'status-warn';
    case 'Descartado': return 'status-off';
    default: return 'status-off';
  }
}

export function getStatusBorderClass(status: EquipmentStatus) {
  switch (status) {
    case 'Disponível': return 'border-status-success text-status-success bg-status-success/10';
    case 'Em Uso': return 'border-secondary text-secondary bg-secondary/10';
    case 'Em Manutenção': return 'border-status-danger text-status-danger bg-status-danger/10';
    case 'Descartado': return 'border-ios-gray text-ios-gray bg-ios-gray/10';
    default: return 'border-ios-gray text-ios-gray bg-ios-gray/10';
  }
}

export function daysBetween(date1: string, date2: string) {
  return Math.floor((new Date(date2).getTime() - new Date(date1).getTime()) / (1000 * 60 * 60 * 24));
}
