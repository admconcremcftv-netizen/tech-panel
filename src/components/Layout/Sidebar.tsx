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
  History,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import logoCompleto from '@/assets/concrem-logo.png';
import logoColapsado from '@/assets/concrem-logo-mini.png';

const menuItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Equipamentos", href: "/equipamentos", icon: Laptop },
  { title: "Novo Ativo", href: "/cadastro", icon: PlusSquare },
  { title: "Relatórios", href: "/relatorios", icon: FileText },
  { title: "Histórico de Logs", href: "/logs", icon: History },
];

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-primary text-primary-foreground transition-all duration-300 ease-in-out border-r border-primary-hover",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div 
        className="flex h-16 items-center justify-center border-b border-primary-hover p-4 cursor-pointer hover:bg-primary-hover transition-colors"
        onClick={toggleSidebar}
      >
        <img 
          src={isCollapsed ? logoColapsado : logoCompleto} 
          alt="Logo" 
          className={cn("transition-all duration-300 object-contain", isCollapsed ? "h-7 w-7" : "h-9 w-[80%]")}
        />
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-64px)] overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-primary-hover scrollbar-track-transparent">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => (
            <div key={item.href}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.href}>
                      <Button
                        variant="sidebar"
                        className={cn(
                          "justify-center px-2",
                          isActive(item.href) && "bg-primary-hover"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-primary text-primary-foreground border-primary-hover">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link to={item.href}>
                  <Button
                    variant="sidebar"
                    className={cn(
                      isActive(item.href) && "bg-primary-hover"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
};
