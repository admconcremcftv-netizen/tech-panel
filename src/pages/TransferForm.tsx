import { useParams, useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { showToast } from '@/components/ToastSystem';

const inputClass = "w-full bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

export default function TransferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eq = Storage.getEquipment(id!);

  const [form, setForm] = useState({ responsavel: '', localizacao: '', motivo: '' });

  if (!eq) return <div className="p-8"><h1 className="font-display">Ativo não encontrado</h1></div>;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    Storage.addEvent(eq.id, 'Transferência', `Transferido para ${form.responsavel} em ${form.localizacao}. Motivo: ${form.motivo}`);

    const all = Storage.getEquipments();
    const updated = all.map(item => item.id === eq.id ? { ...item, responsavel: form.responsavel, localizacao: form.localizacao, status: 'Em Uso' as const } : item);
    Storage.saveEquipments(updated);

    showToast('Transferência concluída');
    navigate(`/equipamento/${eq.id}`);
  };

  return (
    <>
      <PageHeader title="Transferir Ativo" breadcrumb={['Core', 'Transferência', eq.patrimonio]} />
      <form onSubmit={handleSubmit} className="bg-surface border border-border p-5 rounded-sm max-w-2xl">
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Novo responsável *</label>
          <input className={inputClass} required value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Nova localização *</label>
          <input className={inputClass} required value={form.localizacao} onChange={e => setForm(f => ({ ...f, localizacao: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Motivo</label>
          <input className={inputClass} value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
          EFETIVAR TRANSFERÊNCIA
        </button>
      </form>
    </>
  );
}
