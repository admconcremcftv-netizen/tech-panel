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
                  <td className="py-1.5 border-b border-border">{name}</td>
                  <td className="py-1.5 border-b border-border font-mono text-primary">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm md:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h3 className="font-display text-xs">Histórico de Logs ({filteredEvents.length})</h3>
            <button
              onClick={exportLogsCSV}
              className="px-4 py-2 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exportar Logs
            </button>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl shadow-card">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por equipamento, patrimônio ou descrição..."
                  className="w-full bg-background border border-border pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2 flex-wrap">
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-full transition-all border",
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
            </div>

            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-muted rounded-xl">
                  <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Nenhum registro encontrado para sua busca.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-muted ml-3 pl-8 space-y-8">
                  {filteredEvents.map(ev => {
                    const Icon = eventIcons[ev.type] || RefreshCw;
                    const eq = equips.find(e => e.id === ev.equipId);
                    return (
                      <div key={ev.id} className="relative group transition-all">
                        <div className={cn(
                          "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110",
                          eventColors[ev.type]?.split(' ')[1] || 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-3 w-3" />
                        </div>

                        <div className="bg-background border border-border p-4 rounded-xl group-hover:shadow-card-hover transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={cn(
                                "text-[0.65rem] font-black uppercase px-2 py-0.5 rounded border tracking-wider",
                                eventColors[ev.type]
                              )}>
                                {ev.type}
                              </span>
                              {eq && (
                                <span className="text-[0.65rem] font-bold text-foreground font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                  {eq.nome} ({eq.patrimonio})
                                </span>
                              )}
                            </div>
                            <time className="text-[0.65rem] font-bold text-muted-foreground font-mono bg-muted/20 px-2 py-0.5 rounded">
                              {new Date(ev.date).toLocaleString('pt-BR')}
                            </time>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                            {ev.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
