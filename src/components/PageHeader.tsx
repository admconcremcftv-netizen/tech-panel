export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div className="text-[0.7rem] text-muted-foreground/50 uppercase mb-1 font-mono">
      {items.join(' / ')}
    </div>
  );
}

export function PageHeader({ title, children, breadcrumb }: { title: string; children?: React.ReactNode; breadcrumb: string[] }) {
  return (
    <>
      <Breadcrumb items={breadcrumb} />
      <header className="flex justify-between items-end border-b border-border pb-4 mb-8">
        <h1 className="text-xl md:text-2xl font-display">{title}</h1>
        {children && <div className="flex gap-2">{children}</div>}
      </header>
    </>
  );
}
