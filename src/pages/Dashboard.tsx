import { useEffect, useRef } from 'react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { EquipmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

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

function PieChart({ data }: { data: Record<string, number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 150, 150);
    const colors = ['#00AAFF', '#00FF88', '#fbbf24', '#ef4444', '#71717a', '#a855f7'];
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    let lastEnd = -Math.PI / 2;
    let i = 0;
    Object.entries(data).forEach(([, count]) => {
      const slice = (count / total) * 2 * Math.PI;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(75, 75);
      ctx.arc(75, 75, 65, lastEnd, lastEnd + slice);
      ctx.fill();
      lastEnd += slice;
      i++;
    });
  }, [data]);

  return (
    <div>
      <canvas ref={canvasRef} width={150} height={150} />
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.keys(data).map((key, i) => (
          <span key={key} className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: ['#00AAFF', '#00FF88', '#fbbf24', '#ef4444', '#71717a', '#a855f7'][i % 6] }} />
            {key} ({data[key]})
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: Record<string, number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 300, 150);
    const entries = Object.entries(data);
    const max = Math.max(...Object.values(data), 1);
    const barWidth = 40;
    const gap = 25;
    const startX = 20;
    entries.forEach(([, val], idx) => {
      const h = (val / max) * 110;
      ctx.fillStyle = '#00AAFF';
      ctx.fillRect(startX + idx * (barWidth + gap), 140 - h, barWidth, h);
      ctx.fillStyle = '#71717a';
      ctx.font = '11px JetBrains Mono';
      ctx.fillText(String(val), startX + idx * (barWidth + gap) + 14, 133 - h);
    });
  }, [data]);

  return (
    <div>
      <canvas ref={canvasRef} width={300} height={150} />
      <div className="flex gap-4 mt-2">
        {Object.keys(data).map(key => (
          <span key={key} className="text-[0.6rem] text-muted-foreground font-mono">{key.substring(0, 8)}</span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const equips = Storage.getEquipments();
  const events = Storage.getEvents().slice(-15).reverse(); // Aumentado para 15 logs para maior visibilidade

  const inMaint = equips.filter(e => e.status === 'Em Manutenção');
  const alerts: { type: 'error' | 'warn'; message: string }[] = [];

  // Maintenance > 7 days
  inMaint.forEach(e => {
    const lastEv = Storage.getEquipmentEvents(e.id).filter(ev => ev.type === 'Manutenção').pop();
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

  const statusCounts: Record<string, number> = { 'Disponível': 0, 'Em Uso': 0, 'Manutenção': 0, 'Descartado': 0 };
  equips.forEach(eq => {
    if (eq.status === 'Em Manutenção') statusCounts['Manutenção']++;
    else statusCounts[eq.status]++;
  });

  const totalLogs = Storage.getEvents().length;
  const logsHoje = Storage.getEvents().filter(ev => {
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
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
          <span className="font-mono text-status-success text-[0.65rem] font-bold uppercase tracking-widest">SISTEMA: ONLINE</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground italic">Nenhuma movimentação registrada.</p>
              </div>
            ) : (
              events.map(ev => (
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
