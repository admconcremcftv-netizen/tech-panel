import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Equipment } from '@/lib/types';
import { X } from 'lucide-react';
import EquipmentForm from './EquipmentForm';

export default function EquipmentList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await SupabaseService.getEquipments();
    setEquips(data);
    setLoading(false);
  }

  const filteredEquips = equips.filter(eq => {
    const q = search.toLowerCase();
    const matchQuery = !q || eq.nome.toLowerCase().includes(q) || eq.patrimonio.toLowerCase().includes(q) || eq.responsavel.toLowerCase().includes(q);
    const matchStatus = !statusFilter || eq.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <>
      <PageHeader title="Inventário de Ativos" breadcrumb={['Core', 'Equipamentos']}>
        <button 
          onClick={() => setShowNewForm(true)} 
          className="px-4 py-2 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors"
        >
          + NOVO EQUIPAMENTO
        </button>
      </PageHeader>

      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-4xl rounded-lg shadow-2xl relative my-auto">
            <button 
              onClick={() => setShowNewForm(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <EquipmentForm onSuccess={() => {
                setShowNewForm(false);
                loadData();
              }} isModal={true} />
            </div>
          </div>
        </div>
      )}

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

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Patrimônio', 'Equipamento', 'Tipo', 'Status', 'Responsável', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[0.65rem] text-muted-foreground/50 uppercase p-3 border-b border-border-bright">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground font-sans text-sm">Carregando dados do Supabase...</td></tr>
              ) : filteredEquips.map(eq => (
                <tr key={eq.id} className="hover:bg-foreground/[0.02] transition-colors">
                  <td className="p-3 border-b border-border font-sans text-[0.65rem] font-bold uppercase tracking-widest opacity-60">{eq.patrimonio}</td>
                  <td className="p-3 border-b border-border text-sm font-bold">{eq.nome}</td>
                  <td className="p-3 border-b border-border font-sans text-[0.65rem] font-bold uppercase tracking-widest opacity-60">{eq.tipo}</td>
                  <td className="p-3 border-b border-border"><StatusBadge status={eq.status} /></td>
                  <td className="p-3 border-b border-border text-sm font-medium">{eq.responsavel}</td>
                  <td className="p-3 border-b border-border">
                    <Link to={`/equipamento/${eq.id}`} className="px-2 py-1 bg-surface-raised border border-border-bright text-foreground font-sans text-[0.55rem] font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-colors rounded">
                      DETALHES
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && filteredEquips.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground font-sans text-sm">Nenhum equipamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground font-sans text-sm">Carregando dados do Supabase...</div>
          ) : filteredEquips.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-sans text-sm">Nenhum equipamento encontrado.</div>
          ) : (
            filteredEquips.map(eq => (
              <div key={eq.id} className="bg-background border border-border p-4 rounded-sm space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[0.65rem] text-muted-foreground uppercase font-sans font-bold tracking-widest opacity-60">{eq.patrimonio}</p>
                    <h3 className="text-sm font-bold text-foreground">{eq.nome}</h3>
                  </div>
                  <StatusBadge status={eq.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[0.6rem] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">Tipo</p>
                    <p className="font-sans font-medium">{eq.tipo}</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">Responsável</p>
                    <p className="font-medium">{eq.responsavel || '-'}</p>
                  </div>
                </div>
                <Link 
                  to={`/equipamento/${eq.id}`} 
                  className="block w-full text-center py-2.5 bg-surface-raised border border-border-bright text-foreground font-sans font-bold text-[0.65rem] uppercase tracking-wider hover:border-primary hover:text-primary transition-colors rounded-md shadow-sm"
                >
                  VER DETALHES COMPLETOS
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
