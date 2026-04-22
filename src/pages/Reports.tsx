import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { Equipment, EquipmentEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  History, 
  Search, 
  Filter, 
  FileDown, 
  AlertCircle, 
  RefreshCw, 
  ArrowRightLeft, 
  PlusCircle 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const eventIcons: Record<string, LucideIcon> = {
  'Cadastro': PlusCircle,
  'Transferência': ArrowRightLeft,
  'Manutenção': AlertCircle,
  'Atualização': RefreshCw,
};

const eventColors: Record<string, string> = {
  'Cadastro': 'bg-status-success/10 text-status-success border-status-success/20',
  'Transferência': 'bg-status-info/10 text-status-info border-status-info/20',
  'Manutenção': 'bg-status-danger/10 text-status-danger border-status-danger/20',
  'Atualização': 'bg-secondary/10 text-secondary border-secondary/20',
};

export default function Reports() {
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [events, setEvents] = useState<EquipmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  useEffect(() => {
    async function loadData() {
      const [eData, evData] = await Promise.all([
        SupabaseService.getEquipments(),
        SupabaseService.getEvents()
      ]);
      setEquips(eData);
      setEvents(evData);
      setLoading(false);
    }
    loadData();
  }, []);

  const inputClass = "bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

  if (loading) return <div className="p-8"><h1 className="font-display text-xl">Carregando relatórios...</h1></div>;

  const dateFilteredEvents = events.filter(ev => {
    if (dateFrom && ev.date < dateFrom) return false;
    if (dateTo && ev.date > dateTo) return false;
    return true;
  });

  const eventTypes = ['Todos', ...Array.from(new Set(dateFilteredEvents.map(e => e.type)))];

  const filteredEvents = dateFilteredEvents.filter(ev => {
    const eq = equips.find(e => e.id === ev.equipId);
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      ev.desc.toLowerCase().includes(q) ||
      ev.type.toLowerCase().includes(q) ||
      (eq && eq.nome.toLowerCase().includes(q)) ||
      (eq && eq.patrimonio.toLowerCase().includes(q));
    const matchesFilter = filterType === 'Todos' || ev.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const byResponsavel = equips.reduce<Record<string, number>>((acc, eq) => {
    acc[eq.responsavel] = (acc[eq.responsavel] || 0) + 1;
    return acc;
  }, {});

  const exportLogsCSV = () => {
    const headers = ['Data', 'Equipamento', 'Patrimônio', 'Tipo', 'Descrição'];
    const rows = filteredEvents.map(ev => {
      const eq = equips.find(e => e.id === ev.equipId);
      return [
        `"${new Date(ev.date).toLocaleDateString('pt-BR')}"`,
        `"${eq?.nome || 'N/A'}"`,
        `"${eq?.patrimonio || 'N/A'}"`,
        `"${ev.type}"`,
        `"${ev.desc.replace(/\n/g, ' ')}"`
      ].join(';');
    });

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `LOGS_RELATORIO_CONCREM_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const exportCSV = async () => {
    // Buscar dados mais recentes diretamente do Supabase
    const currentEquips = await SupabaseService.getEquipments();

    // Cabeçalhos EXATOS solicitados pelo usuário (sem parênteses)
    const headers = [
      'Tipo de equipamento',
      'Nome do equipamento',
      'Patrimônio',
      'Número de Série',
      'Processador',
      'RAM',
      'Armazenamento',
      'Sistema Operacional',
      'Marca',
      'Modelo',
      'Voltagem',
      'Usuário Responsável',
      'Localização',
      'Valor de Compra',
      'Status operacional',
      'Observações'
    ];

    const rows = currentEquips.map(e => {
      // Mapeamento RIGOROSO seguindo a ordem dos cabeçalhos acima
      return [
        `"${e.tipo || ''}"`,
        `"${e.nome || ''}"`,
        `"${e.patrimonio || ''}"`,
        `"${e.serie || ''}"`,
        `"${e.processador || ''}"`,
        `"${e.ram || ''}"`,
        `"${e.armazenamento || ''}"`,
        `"${e.so || ''}"`,
        `"${e.marca || ''}"`,
        `"${e.modelo || ''}"`,
        `"${e.voltagem || ''}"`,
        `"${e.responsavel || ''}"`,
        `"${e.localizacao || ''}"`,
        `"${e.valor ? 'R$ ' + e.valor : ''}"`,
        `"${e.status || ''}"`,
        `"${(e.observacoes || '').replace(/\n/g, ' ')}"`
      ].join(';');
    });

    // Adicionando BOM (Byte Order Mark) para UTF-8 para o Excel reconhecer acentos corretamente
    // E usando ponto e vírgula como separador para Excel em PT-BR
    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `INVENTARIO_TI_CONCREM_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h3 className="font-display text-xs mb-3">Inventário Geral (CSV)</h3>
          <p className="text-muted-foreground text-sm mb-4">Gera um arquivo CSV com todos os ativos cadastrados para backup.</p>
          <button onClick={exportCSV} className="px-4 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
            DOWNLOAD INVENTÁRIO
          </button>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm">
          <h3 className="font-display text-xs mb-3">Ativos por Responsável</h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(byResponsavel).map(([name, count]) => (
                <tr key={name}>
                  <td className="py-1.5 border-b border-border font-medium">{name}</td>
                  <td className="py-1.5 border-b border-border font-sans font-bold text-primary">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="font-display text-xs uppercase tracking-widest text-[#01270f] dark:text-white">Relatório de Eventos</h3>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-background border border-border pl-9 pr-3 py-1.5 rounded text-xs outline-none focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex gap-1.5 flex-nowrap">
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-2.5 py-1 text-[0.6rem] font-bold rounded transition-all border whitespace-nowrap",
                        filterType === type 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-muted/20 text-muted-foreground border-transparent hover:border-muted"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={exportLogsCSV}
                className="h-8 px-3 text-[0.6rem] gap-2 border border-primary/20 hover:bg-primary/5 text-primary rounded flex items-center justify-center transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" />
                CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[0.6rem] text-muted-foreground/50 uppercase p-3 border-b border-border">Data</th>
                  <th className="text-left text-[0.6rem] text-muted-foreground/50 uppercase p-3 border-b border-border">Equipamento</th>
                  <th className="text-left text-[0.6rem] text-muted-foreground/50 uppercase p-3 border-b border-border whitespace-nowrap">Tipo</th>
                  <th className="text-left text-[0.6rem] text-muted-foreground/50 uppercase p-3 border-b border-border">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground font-mono text-xs">Nenhum evento encontrado no período.</td></tr>
                ) : filteredEvents.map(ev => {
                  const eq = equips.find(e => e.id === ev.equipId);
                  return (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-sans text-[0.65rem] font-bold whitespace-nowrap text-muted-foreground uppercase tracking-wider">
                        {new Date(ev.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{eq?.nome || 'N/A'}</span>
                          <span className="text-[0.6rem] font-sans font-bold uppercase tracking-widest text-muted-foreground opacity-60">{eq?.patrimonio || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={cn(
                          "text-[0.55rem] font-black uppercase px-1.5 py-0.5 rounded border tracking-tighter",
                          eventColors[ev.type] || 'bg-muted text-muted-foreground'
                        )}>
                          {ev.type}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-foreground/80 leading-relaxed min-w-[200px]">
                        {ev.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
