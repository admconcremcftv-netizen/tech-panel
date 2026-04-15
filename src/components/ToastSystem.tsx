import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((msg: string, type: ToastType) => void) | null = null;

export function showToast(msg: string, type: ToastType = 'info') {
  addToastFn?.(msg, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: ToastType) => {
      const id = ++toastId;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-80">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={cn(
            "flex items-center gap-3 px-4 py-4 rounded-lg shadow-2xl border-l-4 animate-slide-in-right transition-all hover:scale-[1.02] border border-border",
            t.type === 'success' ? "bg-card border-l-status-success text-foreground" :
            t.type === 'error' ? "bg-card border-l-status-danger text-foreground" :
            "bg-card border-l-primary text-foreground"
          )}
        >
          <div className={cn(
            "shrink-0 p-1.5 rounded-full",
            t.type === 'success' ? "bg-status-success/10 text-status-success" :
            t.type === 'error' ? "bg-status-danger/10 text-status-danger" :
            "bg-primary/10 text-primary"
          )}>
            {t.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {t.type === 'info' && <Info className="h-5 w-5" />}
          </div>
          <p className="text-sm font-semibold font-sans flex-1 leading-tight">
            {t.message}
          </p>
          <button 
            onClick={() => removeToast(t.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
