import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/equipamentos', label: 'Equipamentos', icon: '💻' },
  { path: '/cadastro', label: 'Novo Ativo', icon: '➕' },
  { path: '/relatorios', label: 'Relatórios', icon: '📄' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-surface-raised border border-border-bright p-2 rounded text-primary font-display text-xs"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-60 bg-surface border-r border-border flex flex-col p-6 gap-12 transition-transform duration-200 md:translate-x-0 md:static',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="text-primary font-mono text-sm border-l-[3px] border-primary pl-3 leading-tight">
          CORE-TECH // ATIVOS
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-muted-foreground hover:bg-surface-raised hover:text-foreground'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto font-mono text-[0.6rem] text-muted-foreground/50">
          v1.0.4-STABLE<br />SYSTEM OFFLINE READY
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full animate-fade-in">
        {children}
      </main>
    </div>
  );
}
