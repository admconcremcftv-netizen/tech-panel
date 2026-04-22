import { useEffect, useState } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { Equipment, EquipmentEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  Tooltip as ReTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

function StatCard({ label, value, accent, color }: { label: string; value: number; accent?: boolean; color?: string }) {
  return (
    <div className="bg-card border border-border p-5 rounded-xl shadow-card transition-all hover:shadow-card-hover group">
      <div className="text-[0.65rem] text-muted-foreground uppercase font-bold tracking-wider mb-1 group-hover:text-primary transition-colors">{label}</div>
      <div className={cn(
        "text-3xl font-bold font-sans",
        color ? color : (accent ? 'text-status-success' : 'text-secondary')
      )}>{value}</div>
    </div>
  );
}

const CHART_COLORS = ['#00AAFF', '#00FF88', '#fbbf24', '#ef4444', '#71717a', '#a855f7'];

const STATUS_ORDER = ['Disponível', 'Em Uso', 'Em Manutenção', 'Descartado'] as const;
const STATUS_LABELS: Record<(typeof STATUS_ORDER)[number], string> = {
  'Disponível': 'Disponivel',
  'Em Uso': 'Em Uso',
  'Em Manutenção': 'Em Manutenção',
  'Descartado': 'Descartado',
};
const STATUS_COLORS: Record<(typeof STATUS_ORDER)[number], string> = {
  'Disponível': 'var(--status-success)',
  'Em Uso': 'var(--secondary)',
  'Em Manutenção': 'var(--status-danger)',
  'Descartado': 'var(--gray)',
};

function PieChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <ReTooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
        </RePieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
        {chartData.map((entry, i) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: Record<string, number> }) {
  const chartData = STATUS_ORDER.map(name => ({ name, value: data[name] ?? 0 }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            interval={0}
            tickMargin={10}
            tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}
            tickFormatter={(value: (typeof STATUS_ORDER)[number]) => STATUS_LABELS[value] ?? value}
          />
          <ReTooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: 'var(--foreground)' }}
            labelFormatter={(label: string) => STATUS_LABELS[label as (typeof STATUS_ORDER)[number]] ?? label}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [events, setEvents] = useState<EquipmentEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8"><h1 className="font-display text-xl">Carregando painel...</h1></div>;

  const dashboardEvents = events.slice(0, 15);
  const inMaint = equips.filter(e => e.status === 'Em Manutenção');
  const alerts: { type: 'error' | 'warn'; message: string }[] = [];

  // Maintenance > 7 days
  inMaint.forEach(e => {
    const lastEv = events.filter(ev => ev.equipId === e.id && ev.type === 'Manutenção').shift();
    if (lastEv) {
      const days = Math.floor((Date.now() - new Date(lastEv.date).getTime()) / (1000 * 60 * 60 * 24));
      if (days > 7) alerts.push({ type: 'error', message: `CRÍTICO: ${e.nome} (${e.patrimonio}) em manutenção há ${days} dias.` });
    }
  });

  // Warranty expiring
  equips.forEach(e => {
    if (!e.garantia) return;
    const days = Math.floor((new Date(e.garantia).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 0 && days < 30) alerts.push({ type: 'warn', message: `AVISO: Garantia de ${e.nome} vence em ${days} dias.` });
  });

  const typeCounts = equips.reduce<Record<string, number>>((acc, eq) => {
    acc[eq.tipo] = (acc[eq.tipo] || 0) + 1;
    return acc;
  }, {});

  const statusCounts: Record<(typeof STATUS_ORDER)[number], number> = {
    'Disponível': 0,
    'Em Uso': 0,
    'Em Manutenção': 0,
    'Descartado': 0,
  };
  equips.forEach(eq => {
    statusCounts[eq.status]++;
  });

  const totalLogs = events.length;
  const logsHoje = events.filter(ev => {
    const logDate = new Date(ev.date);
    const today = new Date();
    return logDate.getDate() === today.getDate() &&
           logDate.getMonth() === today.getMonth() &&
           logDate.getFullYear() === today.getFullYear();
  }).length;

  return (
    <>
      <PageHeader title="Painel de Controle" breadcrumb={['Core', 'Dashboard']}>
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", isSupabaseConfigured ? "bg-status-success" : "bg-status-warning")}></span>
          <span className={cn("font-mono text-[0.65rem] font-bold uppercase tracking-widest", isSupabaseConfigured ? "text-status-success" : "text-status-warning")}>
            {isSupabaseConfigured ? "SISTEMA: ONLINE" : "SISTEMA: OFFLINE"}
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard label="Total Ativos" value={equips.length} />
        <StatCard label="Em Uso" value={equips.filter(e => e.status === 'Em Uso').length} />
        <StatCard label="Disponíveis" value={equips.filter(e => e.status === 'Disponível').length} accent />
        <StatCard label="Manutenção" value={inMaint.length} color="text-status-danger" />
        <StatCard label="Total Logs" value={totalLogs} color="text-secondary" />
        <StatCard label="Logs Hoje" value={logsHoje} color="text-status-info" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border p-4 rounded-sm">
          <h3 className="text-[0.75rem] font-display mb-4">Distribuição por Tipo</h3>
          <PieChart data={typeCounts} />
        </div>
        <div className="bg-surface border border-border p-4 rounded-sm">
          <h3 className="text-[0.75rem] font-display mb-4">Status Operacional</h3>
          <BarChart data={statusCounts} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-card">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-primary rounded-full"></span>
            Alertas de Sistema
          </h3>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground italic">Sem alertas pendentes no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 transition-all hover:translate-x-1 ${
                  a.type === 'error' 
                    ? 'bg-status-danger/10 border-l-status-danger text-status-danger font-medium' 
                    : 'bg-status-warning/10 border-l-status-warning text-status-warning font-medium'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">•</span>
                    <span className="text-sm leading-relaxed">{a.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-card">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-secondary rounded-full"></span>
              Últimas Movimentações (Log)
            </div>
            <span className="text-[0.65rem] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">
              TOP 15
            </span>
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {dashboardEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground italic">Nenhuma movimentação registrada.</p>
              </div>
            ) : (
              dashboardEvents.map(ev => (
                <div key={ev.id} className="group relative pl-4 border-l-2 border-muted hover:border-primary transition-all pb-4 last:pb-0">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-muted group-hover:bg-primary transition-all shadow-[0_0_0_2px_white]"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-[0.7rem] font-bold uppercase px-2 py-0.5 rounded",
                      ev.type === 'Manutenção' ? 'bg-status-danger/10 text-status-danger' :
                      ev.type === 'Transferência' ? 'bg-status-info/10 text-status-info' :
                      ev.type === 'Cadastro' ? 'bg-status-success/10 text-status-success' :
                      'bg-primary/5 text-primary'
                    )}>
                      {ev.type}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground font-medium bg-muted/20 px-1.5 py-0.5 rounded">
                      {new Date(ev.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-snug font-sans">
                    {ev.desc}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
