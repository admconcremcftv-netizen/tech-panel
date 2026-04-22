import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { showToast } from '@/components/ToastSystem';
import { Equipment } from '@/lib/types';
import { cn } from '@/lib/utils';

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="block text-[0.7rem] text-muted-foreground uppercase mb-1">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-background border border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary";

export default function EquipmentForm({ onSuccess, isModal }: { onSuccess?: () => void; isModal?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);

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
      async function loadData() {
        const eq = await SupabaseService.getEquipment(id!);
        if (eq) {
          setForm({
            nome: eq.nome || '',
            tipo: eq.tipo || 'Notebook',
            patrimonio: eq.patrimonio || '',
            serie: eq.serie || '',
            marca: eq.marca || '',
            modelo: eq.modelo || '',
            processador: eq.processador || '',
            ram: eq.ram || '',
            armazenamento: eq.armazenamento || '',
            so: eq.so || '',
            status: eq.status || 'Disponível',
            responsavel: eq.responsavel || '',
            localizacao: eq.localizacao || '',
            dataCompra: eq.dataCompra || '',
            garantia: eq.garantia || '',
            valor: eq.valor || '',
            observacoes: eq.observacoes || '',
            specs: eq.specs || '',
            foto: eq.foto,
            polegadas: eq.polegadas || '',
            resolucao: eq.resolucao || '',
            voltagem: eq.voltagem || '',
            imei: eq.imei || '',
            numeroTelefone: eq.numeroTelefone || '',
            capacidadeBateria: eq.capacidadeBateria || '',
          });
        }
        setLoading(false);
      }
      loadData();
    }
  }, [id]);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.patrimonio) { showToast('Preencha os campos obrigatórios'); return; }
    
    try {
      const resultId = await SupabaseService.saveEquipment(form, id);
      if (resultId) {
        showToast(isEdit ? 'Equipamento atualizado' : 'Equipamento cadastrado');
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(isEdit ? `/equipamento/${id}` : '/equipamentos');
        }
      } else {
        showToast('Erro ao salvar equipamento');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar equipamento';
      showToast(message, 'error');
    }
  };

  const normalizePhotoValue = (value: string) => {
    const raw = value.trim();
    if (!raw) return null;

    const normalized = raw.replace(/\s+/g, '');
    if (normalized.startsWith('data:')) return normalized;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;

    const looksLikeBase64 = /^[A-Za-z0-9+/=]+$/.test(normalized) && normalized.length > 200;
    if (looksLikeBase64) return `data:image/jpeg;base64,${normalized}`;

    return normalized;
  };

  const getPhotoListFromValue = (foto: string | null) => {
    if (!foto) return [];
    const raw = foto.trim();
    if (!raw) return [];

    let list: string[] = [];
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          list = parsed.filter(v => typeof v === 'string') as string[];
        }
      } catch {
        list = [];
      }
    } else {
      list = [raw];
    }

    return list
      .map(v => normalizePhotoValue(v))
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .slice(0, 4);
  };

  const setPhotoList = (list: string[]) => {
    const next = list.filter(Boolean).slice(0, 4);
    setForm(prev => ({
      ...prev,
      foto: next.length === 0 ? null : next.length === 1 ? next[0] : JSON.stringify(next),
    }));
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const current = getPhotoListFromValue(form.foto);
    const remaining = 4 - current.length;
    if (remaining <= 0) {
      showToast('Limite de 4 imagens atingido', 'error');
      return;
    }

    const selected = files.slice(0, remaining);
    try {
      const added = await Promise.all(selected.map(readFileAsDataUrl));
      const next = [...current, ...added].slice(0, 4);
      setPhotoList(next);
    } catch {
      showToast('Erro ao processar imagem', 'error');
      return;
    }

    if (files.length > selected.length) {
      showToast('Algumas imagens foram ignoradas por causa do limite de 4', 'info');
    }
  };

  if (loading) return <div className="p-8"><h1 className="font-display text-xl">Carregando dados...</h1></div>;
  const photoPreviews = getPhotoListFromValue(form.foto);

  return (
    <div className={cn("space-y-6", isModal && "p-0")}>
      {!isModal && <PageHeader title={isEdit ? 'Editar Equipamento' : 'Cadastro de Ativo'} breadcrumb={['Core', isEdit ? 'Editar' : 'Novo Ativo']} />}
      
      <form onSubmit={handleSubmit} className={cn("bg-surface border border-border p-6 rounded-sm", isModal && "border-none p-0")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <FormField label="Nome do equipamento" required>
            <input className={inputClass} value={form.nome} onChange={e => set('nome', e.target.value)} required />
          </FormField>
          <FormField label="Tipo">
            <select className={inputClass} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {['Notebook', 'Desktop', 'Monitor', 'Impressora', 'Celular', 'Periférico', 'Outro'].map(t => (
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

          {form.tipo === 'Impressora' && (
            <FormField label="Voltagem">
              <select className={inputClass} value={form.voltagem} onChange={e => set('voltagem', e.target.value)}>
                <option value="">Selecione</option>
                <option value="110v">110v</option>
                <option value="220v">220v</option>
                <option value="Bivolt">Bivolt</option>
              </select>
            </FormField>
          )}

          {(form.tipo === 'Notebook' || form.tipo === 'Desktop') && (
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

        <FormField label="Imagens do equipamento (até 4)">
          <input type="file" accept="image/*" multiple onChange={handlePhoto} className={inputClass} />
          <div className="mt-2 text-[0.65rem] text-muted-foreground font-mono">
            {photoPreviews.length}/4 anexadas
          </div>
          {photoPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photoPreviews.map((src, idx) => (
                <div key={`${src}-${idx}`} className="relative border border-border rounded-md overflow-hidden bg-background group">
                  <img src={src} alt={`Imagem ${idx + 1}`} className="w-full h-28 object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...photoPreviews];
                      next.splice(idx, 1);
                      setPhotoList(next);
                    }}
                    className="absolute top-2 right-2 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wider bg-red-600 text-white rounded-md shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all border border-red-800/50"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormField>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] hover:bg-primary/80 transition-colors">
            SALVAR REGISTRO
          </button>
          <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-4 py-2.5 bg-surface-raised border border-border-bright text-foreground font-display text-[0.65rem] hover:border-primary hover:text-primary transition-colors">
            CANCELAR
          </button>
        </div>
      </form>
    </div>
  );
}
