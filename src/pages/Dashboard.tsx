import { useEffect, useRef } from 'react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { EquipmentStatus } from '@/lib/types';

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border p-4 rounded-sm shadow-lg">
      <div className="text-[0.7rem] text-muted-foreground uppercase">{label}</div>
      <div className={`text-3xl font-display mt-1 ${accent ? 'text-accent' : 'text-primary'}`}>{value}</div>
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
  const events = Storage.getEvents().slice(-5).reverse();

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

  return (
    <>
      <PageHeader title="Painel de Controle" breadcrumb={['Core', 'Dashboard']}>
        <span className="font-mono text-accent text-xs">SYSTEM_STATUS: NOMINAL</span>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Ativos" value={equips.length} />
        <StatCard label="Em Uso" value={equips.filter(e => e.status === 'Em Uso').length} />
        <StatCard label="Disponíveis" value={equips.filter(e => e.status === 'Disponível').length} accent />
        <StatCard label="Manutenção" value={inMaint.length} />
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-4 rounded-sm">
          <h3 className="text-[0.75rem] font-display mb-4">Alertas de Sistema</h3>
          {alerts.length === 0 ? (
            <p className="font-mono text-muted-foreground/50 text-sm">Sem alertas pendentes.</p>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className={`p-3 rounded-sm mb-2 text-sm border-l-4 ${
                a.type === 'error' ? 'bg-destructive/10 text-red-300 border-l-status-error' : 'bg-status-warn/10 text-yellow-200 border-l-status-warn'
              }`}>
                {a.message}
              </div>
            ))
          )}
        </div>
        <div className="bg-surface border border-border p-4 rounded-sm">
          <h3 className="text-[0.75rem] font-display mb-4">Últimas Movimentações</h3>
          {events.map(ev => (
            <div key={ev.id} className="border-b border-border py-2">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-primary">{ev.type}</span>
                <span className="font-mono text-[0.65rem] text-muted-foreground/50">{ev.date}</span>
              </div>
              <div className="text-sm">{ev.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
