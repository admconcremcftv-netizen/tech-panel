import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { showToast } from '@/components/ToastSystem';
import { useState, useEffect } from 'react';
import { Equipment, EquipmentEvent } from '@/lib/types';

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="font-mono text-[0.55rem] text-muted-foreground/50 uppercase">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isCompletingMaintenance, setIsCompletingMaintenance] = useState(false);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [eq, setEq] = useState<Equipment | null>(null);
  const [events, setEvents] = useState<EquipmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const data = await SupabaseService.getEquipment(id);
      if (data) {
        setEq(data);
        const evs = await SupabaseService.getEquipmentEvents(id);
        setEvents(evs);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [eq?.id]);

  if (loading) return <div className="p-8"><h1 className="font-display text-xl">Carregando dados...</h1></div>;
  if (!eq) return <div className="p-8"><h1 className="font-display text-xl">Ativo não encontrado</h1></div>;

  const formatPhotoSrc = (value: string) => {
    const raw = value.trim();
    if (!raw) return null;

    const normalized = raw.replace(/\s+/g, '');
    if (normalized.startsWith('data:')) return normalized;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;

    const looksLikeBase64 = /^[A-Za-z0-9+/=]+$/.test(normalized) && normalized.length > 200;
    if (looksLikeBase64) return `data:image/jpeg;base64,${normalized}`;

    return normalized;
  };

  const getPhotoList = (foto: Equipment['foto']) => {
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
      .map(v => formatPhotoSrc(v))
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .slice(0, 4);
  };

  const photos = getPhotoList(eq.foto);
  const selectedPhotoSrc = photos[selectedPhotoIndex] || photos[0] || null;

  const qrData = `${window.location.origin}/rastreio/${eq.id}`;

  const handleDelete = async () => {
    const success = await SupabaseService.deleteEquipment(eq.id);
    if (success) {
      showToast('Equipamento removido');
      navigate('/equipamentos');
    } else {
      showToast('Erro ao remover equipamento');
    }
  };

  const handleCompleteMaintenance = async () => {
    if (!eq) return;
    
    const success = await SupabaseService.saveEquipment({
      ...eq,
      status: 'Disponível' // Volta para disponível ao concluir
    }, eq.id);

    if (success) {
      await SupabaseService.addEvent(
        eq.id, 
        'Manutenção', 
        `Manutenção concluída: ${maintenanceNotes || 'Sem observações adicionais'}`
      );
      showToast('Manutenção concluída com sucesso');
      setIsCompletingMaintenance(false);
      setMaintenanceNotes('');
      
      // Recarregar dados
      const updatedEq = await SupabaseService.getEquipment(eq.id);
      if (updatedEq) setEq(updatedEq);
      const evs = await SupabaseService.getEquipmentEvents(eq.id);
      setEvents(evs);
    } else {
      showToast('Erro ao concluir manutenção');
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById('print-area');
    if (printArea) {
      printArea.innerHTML = `
        <div style="display:flex;gap:15px;align-items:center;color:black;font-family:sans-serif;padding:20px;">
          <div style="width:100px;height:100px;background:white;" id="print-qr-placeholder"></div>
          <div>
            <div style="font-weight:bold;font-size:16px;">${eq.nome}</div>
            <div style="font-size:13px;margin-top:4px;">PAT: ${eq.patrimonio}</div>
            <div style="font-size:11px;margin-top:2px;">S/N: ${eq.serie}</div>
            <div style="font-size:9px;margin-top:10px;border-top:1px solid #ccc;padding-top:4px;">CORE-TECH ASSET SYSTEM</div>
          </div>
        </div>
      `;
      printArea.style.display = 'block';
      setTimeout(() => window.print(), 300);
      setTimeout(() => { printArea.style.display = 'none'; }, 1000);
    }
  };

  return (
    <>
      <PageHeader title="Ficha Técnica" breadcrumb={['Core', 'Equipamentos', eq.patrimonio]}>
        <button onClick={handlePrint} className="px-3 py-2 bg-surface-raised border border-border-bright text-foreground font-display text-[0.6rem] hover:border-primary hover:text-primary transition-colors">
          🖨️ ETIQUETA
        </button>
        <Link to={`/equipamento/${eq.id}/editar`} className="px-3 py-2 bg-surface-raised border border-border-bright text-foreground font-display text-[0.6rem] hover:border-primary hover:text-primary transition-colors">
          ✏️ EDITAR
        </Link>
        <button onClick={() => setConfirmDelete(true)} className="px-3 py-2 bg-surface-raised border border-destructive/50 text-destructive font-display text-[0.6rem] hover:bg-destructive hover:text-destructive-foreground transition-colors">
          🗑️ EXCLUIR
        </button>
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-5 rounded-sm">
          <div className="flex justify-between items-start mb-1">
            <h2 className="font-mono text-lg text-[#01270f] dark:text-white">{eq.nome}</h2>
            <StatusBadge status={eq.status} />
          </div>
          <p className="font-mono text-muted-foreground/50 text-xs mb-5">ID: {eq.id}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Patrimônio" value={eq.patrimonio} />
            <Field label="Série" value={eq.serie} />
            <Field label="Marca" value={eq.marca} />
            <Field label="Modelo" value={eq.modelo} />
          </div>

          {eq.specs && (
            <div className="mb-4">
              <div className="font-mono text-[0.55rem] text-muted-foreground/50 uppercase mb-1">Especificações</div>
              <div className="bg-background border border-border p-3 font-mono text-sm">{eq.specs}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Processador" value={eq.processador} />
            <Field label="RAM" value={eq.ram} />
            <Field label="Armazenamento" value={eq.armazenamento} />
            <Field label="Sistema Operacional" value={eq.so} />
            <Field label="Voltagem" value={eq.voltagem} />
            <Field label="Polegadas" value={eq.polegadas} />
            <Field label="Resolução" value={eq.resolucao} />
            <Field label="IMEI" value={eq.imei} />
            <Field label="Nº Telefone" value={eq.numeroTelefone} />
            <Field label="Capacidade Bateria" value={eq.capacidadeBateria} />
            <Field label="Responsável" value={eq.responsavel} />
            <Field label="Localização" value={eq.localizacao} />
            <Field label="Data de Compra" value={eq.dataCompra} />
            <Field label="Garantia até" value={eq.garantia} />
            <Field label="Valor" value={eq.valor ? `R$ ${eq.valor}` : ''} />
          </div>

          {eq.observacoes && <Field label="Observações" value={eq.observacoes} />}

          <div className="mt-8 pt-6 border-t border-border-bright">
            <h3 className="font-display text-[0.65rem] uppercase mb-4 tracking-widest text-[#01270f] dark:text-white">Especificações Técnicas (Ficha)</h3>
            <div className="bg-background/50 border border-border p-4 rounded-md space-y-3">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Processador</div>
                  <div className="text-sm font-mono">{eq.processador || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Memória RAM</div>
                  <div className="text-sm font-mono">{eq.ram || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Armazenamento</div>
                  <div className="text-sm font-mono">{eq.armazenamento || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Sistema Operacional</div>
                  <div className="text-sm font-mono">{eq.so || 'N/A'}</div>
                </div>
                
                {eq.tipo === 'Monitor' && (
                  <>
                    <div>
                      <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Polegadas</div>
                      <div className="text-sm font-mono">{eq.polegadas || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Resolução</div>
                      <div className="text-sm font-mono">{eq.resolucao || 'N/A'}</div>
                    </div>
                  </>
                )}

                {eq.tipo === 'Celular' && (
                  <>
                    <div>
                      <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">IMEI</div>
                      <div className="text-sm font-mono">{eq.imei || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Bateria</div>
                      <div className="text-sm font-mono">{eq.capacidadeBateria || 'N/A'}</div>
                    </div>
                  </>
                )}

                {eq.tipo === 'Impressora' && (
                  <div>
                    <div className="text-[0.5rem] text-muted-foreground uppercase font-bold">Voltagem</div>
                    <div className="text-sm font-mono">{eq.voltagem || 'N/A'}</div>
                  </div>
                )}
              </div>
              
              {eq.specs && (
                <div className="pt-2 border-t border-border-bright/30 mt-2">
                  <div className="text-[0.5rem] text-muted-foreground uppercase font-bold mb-1">Detalhes Adicionais</div>
                  <div className="text-xs font-mono text-foreground/80 leading-relaxed">{eq.specs}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-6 flex-wrap">
            <Link to={`/termo/${eq.id}`} className="px-4 py-2 bg-primary text-primary-foreground font-display text-[0.6rem] hover:bg-primary/80 transition-colors flex items-center gap-2">
              📄 GERAR TERMO
            </Link>
            <Link to={`/transferencia/${eq.id}`} className="px-4 py-2 bg-primary text-primary-foreground font-display text-[0.6rem] hover:bg-primary/80 transition-colors">
              TRANSFERIR
            </Link>
            {eq.status === 'Em Manutenção' ? (
              <button 
                onClick={() => setIsCompletingMaintenance(true)}
                className="px-4 py-2 bg-status-success text-white font-display text-[0.6rem] hover:bg-status-success/80 transition-colors"
              >
                ✅ CONCLUIR MANUTENÇÃO
              </button>
            ) : (
              <Link to={`/manutencao/${eq.id}`} className="px-3 py-2 bg-surface-raised border border-border-bright text-foreground font-display text-[0.6rem] hover:border-primary hover:text-primary transition-colors">
                REGISTRAR MANUTENÇÃO
              </Link>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm">
          {selectedPhotoSrc && (
            <div className="mb-6">
              <h3 className="font-display text-xs mb-3">Foto do Equipamento</h3>
              <div className="bg-background border border-border rounded-md overflow-hidden">
                <img
                  src={selectedPhotoSrc}
                  alt={`Foto do equipamento ${eq.nome}`}
                  className="w-full max-h-[360px] object-contain bg-background"
                  loading="lazy"
                />
              </div>
              {photos.length > 1 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {photos.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={idx === selectedPhotoIndex ? "border-2 border-primary rounded-md overflow-hidden" : "border border-border rounded-md overflow-hidden"}
                    >
                      <img src={src} alt={`Miniatura ${idx + 1}`} className="h-14 w-14 object-cover bg-background" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 className="font-display text-xs mb-4">Identificação Rápida (QR)</h3>
          <div className="bg-white p-3 inline-block rounded border border-border">
            <QRCodeSVG 
              value={qrData} 
              size={128} 
              level="H"
            />
          </div>
          <p className="font-mono text-[0.65rem] text-muted-foreground/50 mt-3 mb-4">
            Escaneie para visualizar os dados técnicos no dispositivo.
          </p>
          
          <button 
            onClick={() => navigate(`/rastreio/${eq.id}`)}
            className="w-full py-2 bg-primary/10 border border-primary/20 font-display text-[0.6rem] uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-[#01270f] dark:text-white"
          >
            🚀 Simular Escaneamento
          </button>

          <h3 className="font-display text-xs mt-8 mb-4">Histórico de Eventos</h3>
          <div className="relative pl-7">
            <div className="absolute left-[9px] top-0 bottom-0 w-px bg-border-bright" />
            {events.map(ev => (
              <div key={ev.id} className="relative mb-5">
                <div className="absolute left-[-22px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                <div className="font-mono text-[0.65rem] text-muted-foreground/50">{ev.date}</div>
                <div className="font-mono text-xs text-[#01270f] dark:text-white">{ev.type}</div>
                <div className="text-sm">{ev.desc}</div>
              </div>
            ))}
            {events.length === 0 && <p className="text-muted-foreground text-sm font-mono">Sem eventos registrados.</p>}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Excluir Equipamento"
        message={`Tem certeza que deseja excluir "${eq.nome}" (${eq.patrimonio})? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {isCompletingMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-lg mb-4 text-[#01270f] dark:text-white uppercase tracking-wider">Concluir Manutenção</h3>
            <p className="text-sm text-muted-foreground mb-4 font-mono">
              Registre o que foi feito no equipamento para finalizar este processo.
            </p>
            <textarea
              className="w-full h-32 bg-background border border-border p-3 font-mono text-sm mb-6 outline-none focus:border-primary resize-none"
              placeholder="Ex: Troca de SSD concluída, sistema reinstalado..."
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsCompletingMaintenance(false);
                  setMaintenanceNotes('');
                }}
                className="px-4 py-2 bg-surface-raised border border-border text-foreground font-display text-[0.65rem] hover:bg-muted transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={handleCompleteMaintenance}
                className="px-6 py-2 bg-status-success text-white font-display text-[0.65rem] hover:bg-status-success/80 transition-colors shadow-lg shadow-status-success/20"
              >
                CONCLUIR E LIBERAR
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="print-area" style={{ display: 'none' }} />
    </>
  );
}
