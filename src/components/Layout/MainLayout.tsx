import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-background">
        {!isSupabaseConfigured && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-status-danger text-white text-[0.65rem] font-bold py-1 text-center uppercase tracking-widest animate-pulse">
            ⚠️ MODO OFFLINE ATIVO - USANDO DADOS MOCKADOS
          </div>
        )}
        <Sidebar />
        <Header />
        <main
          className={cn(
            "pt-16 min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};
