import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from './MainLayout';
import { cn } from '@/lib/utils';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ToastSystem';

export const Header = () => {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { name: "Usuário Admin", email: "admin@concrem.com" };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    showToast("Sessão encerrada.");
    navigate("/login");
  };

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

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-muted">
            <User className="h-5 w-5 text-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleLogout}
            title="Sair do sistema"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
