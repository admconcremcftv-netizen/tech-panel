import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { Bell, Calendar, Settings, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Equipment, EquipmentEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function NotificationsManager() {
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

  const checkMaintenance = (equip: Equipment) => {
    if (!equip.dataCompra) return false;
    const purchaseDate = new Date(equip.dataCompra);
    const sixMonthsLater = new Date(purchaseDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    return new Date() > sixMonthsLater;
  };

  const getUpcomingMaintenances = () => {
    return events.filter(event => {
      if (event.type !== 'Manutenção' || !event.desc.includes('AGENDADO PARA:')) return false;
      const dateMatch = event.desc.match(/AGENDADO PARA: (\d{2}\/\d{2}\/\d{4})/);
      if (!dateMatch) return false;
      const [day, month, year] = dateMatch[1].split('/').map(Number);
      const scheduledDate = new Date(year, month - 1, day);
      return scheduledDate >= new Date();
    });
  };

  if (loading) return <div className="p-8 text-center font-mono">Carregando gerenciador...</div>;

  const expiredEquips = equips.filter(checkMaintenance);
  const upcomingEvents = getUpcomingMaintenances();

  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Notificações" breadcrumb={['Sistema', 'Notificações']} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Manutenções por Garantia (6 meses) */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-status-danger/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-status-danger" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Alertas de Garantia</h3>
              <p className="text-xs text-muted-foreground">Equipamentos com mais de 6 meses de uso.</p>
            </div>
          </div>

          <div className="space-y-3">
            {expiredEquips.length > 0 ? expiredEquips.map(eq => (
              <div key={eq.id} className="p-3 border border-border rounded-lg bg-background/50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-foreground">{eq.nome}</p>
                  <p className="text-[0.65rem] text-muted-foreground uppercase">{eq.patrimonio}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.65rem] font-bold text-status-danger uppercase">Revisão Necessária</p>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-sm text-muted-foreground font-mono italic">Nenhum equipamento pendente de revisão.</p>
            )}
          </div>
        </div>

        {/* Manutenções Agendadas */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-status-info/10 rounded-lg">
              <Calendar className="h-5 w-5 text-status-info" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Cronograma de Serviços</h3>
              <p className="text-xs text-muted-foreground">Próximas manutenções programadas.</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map(ev => {
              const eq = equips.find(e => e.id === ev.equipId);
              return (
                <div key={ev.id} className="p-3 border border-border rounded-lg bg-background/50">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-foreground">{eq?.nome || 'N/A'}</p>
                    <span className="text-[0.6rem] bg-status-info/10 text-status-info px-2 py-0.5 rounded-full font-bold">AGENDADO</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{ev.desc}</p>
                </div>
              );
            }) : (
              <p className="text-center py-8 text-sm text-muted-foreground font-mono italic">Nenhuma manutenção agendada.</p>
            )}
          </div>
        </div>

        {/* Configurações de Alerta */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Configurações de Notificação</h3>
              <p className="text-xs text-muted-foreground">Defina como e quando o sistema deve emitir alertas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg bg-background/30">
              <p className="text-xs font-bold text-foreground uppercase mb-2">Intervalo de Garantia</p>
              <div className="flex items-center gap-3">
                <input type="number" defaultValue="6" className="w-16 bg-background border border-border px-2 py-1 text-sm rounded outline-none" />
                <span className="text-xs text-muted-foreground">Meses</span>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg bg-background/30">
              <p className="text-xs font-bold text-foreground uppercase mb-2">Aviso Prévio (Agendamento)</p>
              <div className="flex items-center gap-3">
                <input type="number" defaultValue="1" className="w-16 bg-background border border-border px-2 py-1 text-sm rounded outline-none" />
                <span className="text-xs text-muted-foreground">Dia(s) antes</span>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg bg-background/30">
              <p className="text-xs font-bold text-foreground uppercase mb-2">Som de Alerta</p>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                <span className="text-xs text-muted-foreground">Habilitar bipes</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest px-8">Salvar Preferências</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
