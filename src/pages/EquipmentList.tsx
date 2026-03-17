import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { EquipmentStatus } from '@/lib/types';

export default function EquipmentList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const equips = Storage.getEquipments().filter(eq => {
    const q = search.toLowerCase();
    const matchQuery = !q || eq.nome.toLowerCase().includes(q) || eq.patrimonio.toLowerCase().includes(q) || eq.responsavel.toLowerCase().includes(q);
    const matchStatus = !statusFilter || eq.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <>
      <PageHeader title="Inventário de Ativos" breadcrumb={['Core', 'Equipamentos']}>
        <Link to="/cadastro" className="px-4 py-2 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
          + NOVO EQUIPAMENTO
        </Link>
      </PageHeader>

      <div className="bg-surface border border-border p-4 rounded-sm">
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="BUSCAR POR NOME, PATRIMÔNIO OU RESPONSÁVEL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none md:w-64"
          >
            <option value="">TODOS OS STATUS</option>
            <option>Disponível</option>
            <option>Em Uso</option>
            <option>Em Manutenção</option>
            <option>Descartado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Patrimônio', 'Equipamento', 'Tipo', 'Status', 'Responsável', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[0.65rem] text-muted-foreground/50 uppercase p-3 border-b border-border-bright">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equips.map(eq => (
                <tr key={eq.id} className="hover:bg-foreground/[0.02] transition-colors">
                  <td className="p-3 border-b border-border font-mono text-sm">{eq.patrimonio}</td>
                  <td className="p-3 border-b border-border text-sm font-semibold">{eq.nome}</td>
                  <td className="p-3 border-b border-border font-mono text-xs">{eq.tipo}</td>
                  <td className="p-3 border-b border-border"><StatusBadge status={eq.status} /></td>
                  <td className="p-3 border-b border-border text-sm">{eq.responsavel}</td>
                  <td className="p-3 border-b border-border">
                    <Link to={`/equipamento/${eq.id}`} className="px-2 py-1 bg-surface-raised border border-border-bright text-foreground font-display text-[0.55rem] hover:border-primary hover:text-primary transition-colors">
                      DETALHES
                    </Link>
                  </td>
                </tr>
              ))}
              {equips.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground font-mono text-sm">Nenhum equipamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
