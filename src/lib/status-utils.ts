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
    case 'Disponível': return 'border-status-ok text-status-ok bg-status-ok/10';
    case 'Em Uso': return 'border-status-info text-status-info bg-status-info/10';
    case 'Em Manutenção': return 'border-status-warn text-status-warn bg-status-warn/10';
    case 'Descartado': return 'border-status-off text-status-off bg-status-off/10';
    default: return 'border-status-off text-status-off bg-status-off/10';
  }
}

export function daysBetween(date1: string, date2: string) {
  return Math.floor((new Date(date2).getTime() - new Date(date1).getTime()) / (1000 * 60 * 60 * 24));
}
