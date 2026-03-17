import { useParams, useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { showToast } from '@/components/ToastSystem';

const inputClass = "w-full bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

export default function MaintenanceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eq = Storage.getEquipment(id!);

  const [form, setForm] = useState({
    type: 'Preventiva',
    desc: '',
    tech: '',
    status: 'Em Manutenção',
    cost: '',
  });

  if (!eq) return <div className="p-8"><h1 className="font-display">Ativo não encontrado</h1></div>;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    Storage.addEvent(eq.id, 'Manutenção', `${form.type}: ${form.desc} (Técnico: ${form.tech})${form.cost ? ` - Custo: R$ ${form.cost}` : ''}`);

    const all = Storage.getEquipments();
    const updated = all.map(item => item.id === eq.id ? { ...item, status: form.status as any } : item);
    Storage.saveEquipments(updated);

    showToast('Manutenção registrada');
    navigate(`/equipamento/${eq.id}`);
  };

  return (
    <>
      <PageHeader title="Registrar Manutenção" breadcrumb={['Core', 'Manutenção', eq.patrimonio]} />
      <form onSubmit={handleSubmit} className="bg-surface border border-border p-5 rounded-sm max-w-2xl">
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Tipo de serviço</label>
          <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {['Preventiva', 'Corretiva', 'Atualização', 'Limpeza'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Descrição do problema / serviço *</label>
          <textarea className={inputClass} required value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Técnico responsável *</label>
          <input className={inputClass} required value={form.tech} onChange={e => setForm(f => ({ ...f, tech: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Custo (R$)</label>
          <input className={inputClass} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">Status resultante</label>
          <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {['Em Manutenção', 'Disponível', 'Em Uso'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
          REGISTRAR
        </button>
      </form>
    </>
  );
}
