import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from './MainLayout';
import { cn } from '@/lib/utils';
import { Bell, LogOut, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ToastSystem';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover';
import { Equipment, EquipmentEvent } from '@/lib/types';
import { SupabaseService } from '@/lib/supabaseService';

export const Header = () => {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [events, setEvents] = useState<EquipmentEvent[]>([]);

  useEffect(() => {
    // Aplicar tema iOS
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    async function loadData() {
      const [equipsData, eventsData] = await Promise.all([
        SupabaseService.getEquipments(),
        SupabaseService.getEvents()
      ]);
      setEquips(equipsData);
      setEvents(eventsData);
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const checkMaintenance = (equip: Equipment) => {
    if (!equip.dataCompra) return false;
    const purchaseDate = new Date(equip.dataCompra);
    const sixMonthsLater = new Date(purchaseDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    return new Date() > sixMonthsLater;
  };

  const checkUpcomingMaintenance = (event: EquipmentEvent) => {
    if (event.type !== 'Manutenção' || !event.desc.includes('AGENDADO PARA:')) return null;
    
    // Extrair data do formato: AGENDADO PARA: DD/MM/AAAA às HH:MM
    const dateMatch = event.desc.match(/AGENDADO PARA: (\d{2}\/\d{2}\/\d{4})/);
    if (!dateMatch) return null;
    
    const [day, month, year] = dateMatch[1].split('/').map(Number);
    const scheduledDate = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Se a data agendada for amanhã
    if (scheduledDate.getTime() === tomorrow.getTime()) {
      const equip = equips.find(e => e.id === event.equipId);
      return {
        id: `upcoming-${event.id}`,
        title: "Manutenção Agendada (Amanhã)",
        description: `Lembrete: Manutenção para ${equip?.nome || 'Equipamento'} agendada para amanhã.`,
        time: "Lembrete",
        path: equip ? `/equipamento/${equip.id}` : "/"
      };
    }
    
    return null;
  };

  const maintenanceNotifications = equips
    .filter(checkMaintenance)
    .map(eq => ({
      id: `maint-${eq.id}`,
      title: "Manutenção Necessária",
      description: `Garantia de 6 meses expirada para ${eq.nome} (${eq.patrimonio}).`,
      time: "Aviso de Sistema",
      path: `/equipamento/${eq.id}`
    }));

  const upcomingNotifications = events
    .map(checkUpcomingMaintenance)
    .filter((n): n is NonNullable<typeof n> => n !== null);

  const staticNotifications = [
    { id: 2, title: "Sistema Atualizado", description: "Nova versão v1.0.4 instalada com sucesso.", time: "1 hora atrás", path: "/logs" },
  ];

  const notifications = [...upcomingNotifications, ...maintenanceNotifications, ...staticNotifications];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Painel de Controle
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button 
          id="theme-toggle" 
          onClick={toggleTheme} 
          style={{
            background: 'var(--fill-tertiary)',
            border: '1px solid var(--separator-opaque)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span id="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span> Tema
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground relative"
              title="Ver notificações"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-popover text-popover-foreground shadow-xl border-border" align="end">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Notificações ({notifications.length})</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <PopoverClose key={notif.id} asChild>
                    <div 
                      className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(notif.path)}
                    >
                      <p className={cn(
                        "text-sm font-medium transition-colors",
                        String(notif.id).startsWith('upcoming-') ? "text-status-info" :
                        String(notif.id).startsWith('maint-') ? "text-status-danger" : 
                        "text-foreground"
                      )}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{notif.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2 uppercase font-bold tracking-tighter">{notif.time}</p>
                    </div>
                  </PopoverClose>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Nenhuma notificação encontrada.
                </div>
              )}
            </div>
            <div className="p-2 border-t border-border text-center">
              <button 
                onClick={() => navigate("/notificacoes")}
                className="w-full text-[0.65rem] font-bold uppercase tracking-wider h-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm"
              >
                Gerenciar Notificações
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
