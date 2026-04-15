import { useNavigate } from 'react-router-dom';

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div className="text-[0.7rem] text-muted-foreground/50 uppercase mb-1 font-mono">
      {items.join(' / ')}
    </div>
  );
}

export function PageHeader({
  title,
  children,
  breadcrumb,
  showBack = true,
  backTo = '/',
}: {
  title: string;
  children?: React.ReactNode;
  breadcrumb: string[];
  showBack?: boolean;
  backTo?: string;
}) {
  const navigate = useNavigate();
  const historyState = (typeof window !== 'undefined' ? (window.history.state as { idx?: number } | null) : null) ?? null;
  const canGoBack = typeof historyState?.idx === 'number' && historyState.idx > 0;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate(backTo);
  };

  return (
    <>
      <Breadcrumb items={breadcrumb} />
      <header className="flex justify-between items-center border-b border-border pb-4 mb-8 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="shrink-0 px-3 py-2 bg-surface-raised border border-border-bright text-foreground font-display text-[0.6rem] uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              ← Voltar
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-display truncate">{title}</h1>
        </div>
        {children && <div className="flex gap-2">{children}</div>}
      </header>
    </>
  );
}
