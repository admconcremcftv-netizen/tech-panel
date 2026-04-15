import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { showToast } from '@/components/ToastSystem';
import { Equipment } from '@/lib/types';
import { cn } from '@/lib/utils';

const inputClass = "w-full bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

export default function MaintenanceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eq, setEq] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: 'Preventiva',
    desc: '',
    tech: '',
    status: 'Em Manutenção' as Equipment['status'],
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
  });

  useEffect(() => {
    async function loadData() {
      if (id) {
        const data = await SupabaseService.getEquipment(id);
        setEq(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-8"><h1 className="font-display">Carregando...</h1></div>;
  if (!eq) return <div className="p-8"><h1 className="font-display">Ativo não encontrado</h1></div>;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let eventDesc = `${form.type}: ${form.desc} (Técnico: ${form.tech})`;
    if (form.isScheduled) {
      eventDesc += ` - AGENDADO PARA: ${new Date(form.scheduledDate).toLocaleDateString('pt-BR')} às ${form.scheduledTime}`;
    }
    
    await SupabaseService.addEvent(eq.id, 'Manutenção', eventDesc);

    const updatedEq: Equipment = { ...eq, status: form.status };
    await SupabaseService.saveEquipment(updatedEq, eq.id);

    showToast(form.isScheduled ? 'Manutenção agendada com sucesso' : 'Manutenção registrada');
    navigate(`/equipamento/${eq.id}`);
  };

  return (
    <>
      <PageHeader title="Registrar Manutenção" breadcrumb={['Core', 'Manutenção', eq.patrimonio]} />
      <form onSubmit={handleSubmit} className="bg-surface border border-border p-5 rounded-sm max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1 font-bold">Tipo de serviço</label>
            <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Preventiva', 'Corretiva', 'Atualização', 'Limpeza'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1 font-bold">Status resultante</label>
            <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Em Manutenção', 'Disponível', 'Em Uso'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-6 p-4 bg-background/50 border border-dashed border-border rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <input 
              type="checkbox" 
              id="isScheduled"
              className="w-4 h-4 accent-primary cursor-pointer"
              checked={form.isScheduled}
              onChange={e => setForm(f => ({ ...f, isScheduled: e.target.checked }))}
            />
            <label htmlFor="isScheduled" className="text-sm font-bold text-foreground cursor-pointer select-none">
              AGENDAR MANUTENÇÃO FUTURA?
            </label>
          </div>

          {form.isScheduled && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-[0.65rem] text-muted-foreground uppercase mb-1">Data do Agendamento</label>
                <input 
                  type="date" 
                  className={inputClass}
                  required={form.isScheduled}
                  value={form.scheduledDate}
                  onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[0.65rem] text-muted-foreground uppercase mb-1">Hora do Agendamento</label>
                <input 
                  type="time" 
                  className={inputClass}
                  required={form.isScheduled}
                  value={form.scheduledTime}
                  onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1 font-bold">Descrição do problema / serviço *</label>
          <textarea className={cn(inputClass, "h-32 resize-none")} required value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
        </div>
        <div className="mb-6">
          <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1 font-bold">Técnico responsável *</label>
          <input className={inputClass} required value={form.tech} onChange={e => setForm(f => ({ ...f, tech: e.target.value }))} />
        </div>
        <button type="submit" className="w-full md:w-auto px-10 py-3 bg-primary text-primary-foreground font-display text-[0.7rem] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">
          {form.isScheduled ? 'AGENDAR MANUTENÇÃO' : 'REGISTRAR MANUTENÇÃO'}
        </button>
      </form>
    </>
  );
}
