import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { showToast } from '@/components/ToastSystem';
import { Equipment } from '@/lib/types';

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

export default function EquipmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    nome: '', tipo: 'Notebook', patrimonio: '', serie: '', marca: '', modelo: '',
    processador: '', ram: '', armazenamento: '', so: '',
    status: 'Disponível' as Equipment['status'],
    responsavel: '', localizacao: '', dataCompra: '', garantia: '', valor: '',
    observacoes: '', specs: '', foto: null as string | null,
    polegadas: '', resolucao: '', voltagem: '', imei: '', numeroTelefone: '', capacidadeBateria: '',
  });

  useEffect(() => {
    if (id) {
      const eq = Storage.getEquipment(id);
      if (eq) setForm({ ...eq });
    }
  }, [id]);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.patrimonio) { showToast('Preencha os campos obrigatórios'); return; }
    
    Storage.saveEquipment(form, id);
    showToast(isEdit ? 'Equipamento atualizado' : 'Equipamento cadastrado');
    navigate(isEdit ? `/equipamento/${id}` : '/equipamentos');
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, foto: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <PageHeader title={isEdit ? 'Editar Equipamento' : 'Cadastro de Ativo'} breadcrumb={['Core', isEdit ? 'Editar' : 'Novo Ativo']} />

      <form onSubmit={handleSubmit} className="bg-surface border border-border p-5 rounded-sm">
        <div className="grid md:grid-cols-2 gap-x-4">
          <FormField label="Nome do equipamento" required>
            <input className={inputClass} value={form.nome} onChange={e => set('nome', e.target.value)} required />
          </FormField>
          <FormField label="Tipo">
            <select className={inputClass} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {['Notebook', 'Desktop', 'Monitor', 'Impressora', 'Celular', 'Servidor', 'Periférico', 'Outro'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Patrimônio" required>
            <input className={inputClass} value={form.patrimonio} onChange={e => set('patrimonio', e.target.value)} required />
          </FormField>
          <FormField label="Número de série">
            <input className={inputClass} value={form.serie} onChange={e => set('serie', e.target.value)} />
          </FormField>
          
          {/* Campos Dinâmicos por Tipo */}
          {form.tipo === 'Monitor' && (
            <>
              <FormField label="Polegadas">
                <input className={inputClass} value={form.polegadas} onChange={e => set('polegadas', e.target.value)} placeholder='Ex: 24"' />
              </FormField>
              <FormField label="Resolução">
                <input className={inputClass} value={form.resolucao} onChange={e => set('resolucao', e.target.value)} placeholder="Ex: 1920x1080" />
              </FormField>
            </>
          )}

          {form.tipo === 'Celular' && (
            <>
              <FormField label="IMEI">
                <input className={inputClass} value={form.imei} onChange={e => set('imei', e.target.value)} />
              </FormField>
              <FormField label="Número do Telefone">
                <input className={inputClass} value={form.numeroTelefone} onChange={e => set('numeroTelefone', e.target.value)} />
              </FormField>
              <FormField label="Capacidade Bateria (mAh)">
                <input className={inputClass} value={form.capacidadeBateria} onChange={e => set('capacidadeBateria', e.target.value)} />
              </FormField>
            </>
          )}

          {(form.tipo === 'Impressora' || form.tipo === 'Servidor') && (
            <FormField label="Voltagem">
              <select className={inputClass} value={form.voltagem} onChange={e => set('voltagem', e.target.value)}>
                <option value="">Selecione</option>
                <option value="110v">110v</option>
                <option value="220v">220v</option>
                <option value="Bivolt">Bivolt</option>
              </select>
            </FormField>
          )}

          {(form.tipo === 'Notebook' || form.tipo === 'Desktop' || form.tipo === 'Servidor') && (
            <>
              <FormField label="Processador">
                <input className={inputClass} value={form.processador} onChange={e => set('processador', e.target.value)} />
              </FormField>
              <FormField label="RAM">
                <input className={inputClass} value={form.ram} onChange={e => set('ram', e.target.value)} />
              </FormField>
              <FormField label="Armazenamento">
                <input className={inputClass} value={form.armazenamento} onChange={e => set('armazenamento', e.target.value)} />
              </FormField>
              <FormField label="Sistema operacional">
                <input className={inputClass} value={form.so} onChange={e => set('so', e.target.value)} />
              </FormField>
            </>
          )}

          <FormField label="Marca">
            <input className={inputClass} value={form.marca} onChange={e => set('marca', e.target.value)} />
          </FormField>
          <FormField label="Modelo">
            <input className={inputClass} value={form.modelo} onChange={e => set('modelo', e.target.value)} />
          </FormField>
        </div>

        <FormField label="Especificações técnicas">
          <textarea className={inputClass} rows={3} value={form.specs} onChange={e => set('specs', e.target.value)} />
        </FormField>

        <div className="grid md:grid-cols-2 gap-x-4">
          <FormField label="Responsável">
            <input className={inputClass} value={form.responsavel} onChange={e => set('responsavel', e.target.value)} />
          </FormField>
          <FormField label="Localização">
            <input className={inputClass} value={form.localizacao} onChange={e => set('localizacao', e.target.value)} />
          </FormField>
          <FormField label="Data de compra">
            <input type="date" className={inputClass} value={form.dataCompra} onChange={e => set('dataCompra', e.target.value)} />
          </FormField>
          <FormField label="Vencimento garantia">
            <input type="date" className={inputClass} value={form.garantia} onChange={e => set('garantia', e.target.value)} />
          </FormField>
          <FormField label="Valor de compra (R$)">
            <input className={inputClass} value={form.valor} onChange={e => set('valor', e.target.value)} />
          </FormField>
          <FormField label="Status operacional">
            <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
              {['Disponível', 'Em Uso', 'Em Manutenção', 'Descartado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Observações">
          <textarea className={inputClass} rows={2} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} />
        </FormField>

        <FormField label="Foto do equipamento">
          <input type="file" accept="image/*" onChange={handlePhoto} className={inputClass} />
          {form.foto && <img src={form.foto} alt="Preview" className="mt-2 max-w-[200px] border border-border" />}
        </FormField>

        <div className="flex gap-3 mt-4">
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
            SALVAR REGISTRO
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 bg-surface-raised border border-border-bright text-foreground font-display text-[0.65rem] hover:border-primary hover:text-primary transition-colors">
            CANCELAR
          </button>
        </div>
      </form>
    </>
  );
}
