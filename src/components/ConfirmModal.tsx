import { ReactNode } from 'react';

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80" onClick={onCancel}>
      <div className="bg-surface border border-border-bright p-6 max-w-md w-full mx-4 shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-sm mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-surface-raised border border-border-bright text-foreground font-display text-[0.65rem] hover:border-primary hover:text-primary transition-colors">
            CANCELAR
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-destructive text-destructive-foreground font-display text-[0.65rem] hover:bg-destructive/80 transition-colors">
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}
