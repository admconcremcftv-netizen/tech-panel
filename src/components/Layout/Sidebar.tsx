import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from './MainLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Laptop,
  PlusSquare,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  X,
} from 'lucide-react';

import logoCompleto from '@/assets/concrem-logo.png';
import logoColapsado from '@/assets/concrem-logo-mini.png';
import { showToast } from '@/components/ToastSystem';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const menuItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Equipamentos", href: "/equipamentos", icon: Laptop },
  { title: "Relatórios", href: "/relatorios", icon: FileText },
];

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { name: "Usuário Admin", email: "admin@concrem.com" };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    showToast("Sessão encerrada.", "info");
    navigate("/login");
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar-background text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border flex flex-col",
          isCollapsed ? "md:w-16" : "md:w-64",
          isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border p-4 shrink-0">
          <div 
            className="flex items-center justify-center flex-1 cursor-pointer hover:bg-sidebar-accent transition-colors py-2 rounded-md"
            onClick={() => {
              if (window.innerWidth >= 768) toggleSidebar();
            }}
          >
            <img 
              src={isCollapsed ? logoColapsado : logoCompleto} 
              alt="Logo" 
              className={cn(
                "transition-all duration-300 object-contain", 
                isCollapsed ? "h-8 w-8" : "h-10 w-auto max-w-[180px]"
              )}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={closeMobile}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item) => (
              <div key={item.href}>
                {isCollapsed ? (
                  <div className="hidden md:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.href}>
                          <Button
                            variant="sidebar"
                            className={cn(
                              "justify-center px-2",
                              isActive(item.href) && "bg-sidebar-accent"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-sidebar-background text-sidebar-foreground border-sidebar-border">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : null}
                
                <div className={cn(isCollapsed ? "md:hidden" : "block")}>
                  <Link to={item.href} onClick={closeMobile}>
                    <Button
                      variant="sidebar"
                      className={cn(
                        isActive(item.href) && "bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </TooltipProvider>
        </nav>

      {/* User Section */}
      <div className="mt-auto border-t border-sidebar-border p-4">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center border border-white/10">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-white/60 hover:text-status-danger transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-sidebar-background text-sidebar-foreground border-sidebar-border p-3">
                <p className="text-xs font-bold">{user.name}</p>
                <p className="text-[10px] opacity-60">{user.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/30 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/50 truncate leading-tight">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-white/60 hover:text-status-danger hover:bg-status-danger/10 h-9 px-3"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span className="text-[0.7rem] font-bold uppercase tracking-wider">Sair do Sistema</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  </>
);
};
