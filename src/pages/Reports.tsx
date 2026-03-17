import { useState } from 'react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';

export default function Reports() {
  const equips = Storage.getEquipments();
  const events = Storage.getEvents();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const inputClass = "bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

  const filteredEvents = events.filter(ev => {
    if (dateFrom && ev.date < dateFrom) return false;
    if (dateTo && ev.date > dateTo) return false;
    return true;
  });

  const maintenanceEvents = filteredEvents.filter(ev => ev.type === 'Manutenção');

  const byResponsavel = equips.reduce<Record<string, number>>((acc, eq) => {
    acc[eq.responsavel] = (acc[eq.responsavel] || 0) + 1;
    return acc;
  }, {});

  const exportCSV = () => {
    const headers = ['ID', 'Nome', 'Tipo', 'Patrimônio', 'Série', 'Status', 'Responsável', 'Localização', 'Data Compra', 'Garantia', 'Valor'];
    const rows = equips.map(e => [e.id, e.nome, e.tipo, e.patrimonio, e.serie, e.status, e.responsavel, e.localizacao, e.dataCompra, e.garantia, e.valor].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `inventario_coretech_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <>
      <PageHeader title="Relatórios e Exportação" breadcrumb={['Core', 'Relatórios']} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <div>
          <label className="block text-[0.65rem] text-muted-foreground uppercase mb-1">Data início</label>
          <input type="date" className={inputClass} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-[0.65rem] text-muted-foreground uppercase mb-1">Data fim</label>
          <input type="date" className={inputClass} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-5 rounded-sm">
          <h3 className="font-display text-xs mb-3">Exportar Inventário</h3>
          <p className="text-muted-foreground text-sm mb-4">Gera um arquivo CSV com todos os ativos cadastrados.</p>
          <button onClick={exportCSV} className="px-4 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
            DOWNLOAD CSV
          </button>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm">
          <h3 className="font-display text-xs mb-3">Ativos por Responsável</h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(byResponsavel).map(([name, count]) => (
                <tr key={name}>
                  <td className="py-1.5 border-b border-border">{name}</td>
                  <td className="py-1.5 border-b border-border font-mono text-primary">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm md:col-span-2">
          <h3 className="font-display text-xs mb-3">Manutenções {dateFrom || dateTo ? 'no período' : 'registradas'} ({maintenanceEvents.length})</h3>
          {maintenanceEvents.length === 0 ? (
            <p className="text-muted-foreground font-mono text-sm">Nenhuma manutenção encontrada.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[0.65rem] text-muted-foreground/50 uppercase p-2 border-b border-border-bright">Data</th>
                  <th className="text-left text-[0.65rem] text-muted-foreground/50 uppercase p-2 border-b border-border-bright">Equipamento</th>
                  <th className="text-left text-[0.65rem] text-muted-foreground/50 uppercase p-2 border-b border-border-bright">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceEvents.map(ev => {
                  const eq = equips.find(e => e.id === ev.equipId);
                  return (
                    <tr key={ev.id}>
                      <td className="p-2 border-b border-border font-mono text-xs">{ev.date}</td>
                      <td className="p-2 border-b border-border text-sm">{eq?.nome || 'N/A'}</td>
                      <td className="p-2 border-b border-border text-sm">{ev.desc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
