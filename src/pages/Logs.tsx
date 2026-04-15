import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { EquipmentEvent } from '@/lib/types';
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
import { Button } from '@/components/ui/button';

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

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [allEvents, setAllEvents] = useState<EquipmentEvent[]>([]);
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [evData, eqData] = await Promise.all([
        SupabaseService.getEvents(),
        SupabaseService.getEquipments()
      ]);
      setAllEvents(evData);
      setEquips(eqData);
      setLoading(false);
    }
    loadData();
  }, []);

  const eventTypes = ['Todos', ...Array.from(new Set(allEvents.map(e => e.type)))];

  const filteredEvents = allEvents.filter(ev => {
    const eq = equips.find(e => e.id === ev.equipId);
    const matchesSearch = ev.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ev.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (eq && eq.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (eq && eq.patrimonio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'Todos' || ev.type === filterType;
    return matchesSearch && matchesFilter;
  });

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
    link.setAttribute('download', `LOGS_SISTEMA_CONCREM_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  if (loading) return <div className="p-8"><h1 className="font-display text-xl">Carregando logs...</h1></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Histórico de Logs" breadcrumb={['Sistema', 'Logs']}>
        <Button 
          onClick={exportLogsCSV}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm border-none" 
          size="sm"
        >
          <FileDown className="h-4 w-4" />
          Exportar Logs
        </Button>
      </PageHeader>

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
            <div className="flex gap-2">
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
              {filteredEvents.map((ev, index) => {
                const Icon = eventIcons[ev.type] || RefreshCw;
                const eq = equips.find(e => e.id === ev.equipId);
                return (
                  <div key={ev.id} className="relative group transition-all">
                    {/* Dot on timeline */}
                    <div className={cn(
                      "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110",
                      eventColors[ev.type]?.split(' ')[1] || 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="h-3 w-3" />
                    </div>

                    <div className="bg-background border border-border p-4 rounded-xl group-hover:shadow-card-hover transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
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
  );
}
