import { ReactNode } from 'react';

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card border border-border p-8 max-w-md w-full mx-4 shadow-2xl rounded-xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-status-danger/10 rounded-full">
            <svg className="h-6 w-6 text-status-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
        </div>
        <p className="text-foreground text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onCancel} 
            className="px-6 py-2.5 bg-muted text-foreground font-bold text-xs rounded-lg hover:bg-muted/80 transition-all uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-2.5 bg-status-danger text-white font-bold text-xs rounded-lg hover:bg-status-danger/90 shadow-lg shadow-status-danger/20 transition-all uppercase tracking-wider"
          >
            Excluir Agora
          </button>
        </div>
      </div>
    </div>
  );
}
