import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Storage } from '@/lib/storage';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { showToast } from '@/components/ToastSystem';
import { useState } from 'react';

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

  const eq = Storage.getEquipment(id!);
  if (!eq) return <div className="p-8"><h1 className="font-display text-xl">Ativo não encontrado</h1></div>;

  const events = Storage.getEquipmentEvents(eq.id).reverse();
  const qrUrl = `${window.location.origin}/#/equipamento/${eq.id}`;

  const handleDelete = () => {
    Storage.deleteEquipment(eq.id);
    showToast('Equipamento removido');
    navigate('/equipamentos');
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
            <h2 className="font-mono text-primary text-lg">{eq.nome}</h2>
            <StatusBadge status={eq.status} />
          </div>
          <p className="font-mono text-muted-foreground/50 text-xs mb-5">ID: {eq.id}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Processador" value={eq.processador} />
            <Field label="RAM" value={eq.ram} />
            <Field label="Armazenamento" value={eq.armazenamento} />
            <Field label="Sistema Operacional" value={eq.so} />
            <Field label="Responsável" value={eq.responsavel} />
            <Field label="Localização" value={eq.localizacao} />
            <Field label="Data de Compra" value={eq.dataCompra} />
            <Field label="Garantia até" value={eq.garantia} />
            <Field label="Valor" value={eq.valor ? `R$ ${eq.valor}` : ''} />
          </div>

          {eq.observacoes && <Field label="Observações" value={eq.observacoes} />}

          <div className="flex gap-2 mt-6 flex-wrap">
            <Link to={`/transferencia/${eq.id}`} className="px-4 py-2 bg-primary text-primary-foreground font-display text-[0.6rem] hover:bg-primary/80 transition-colors">
              TRANSFERIR
            </Link>
            <Link to={`/manutencao/${eq.id}`} className="px-3 py-2 bg-surface-raised border border-border-bright text-foreground font-display text-[0.6rem] hover:border-primary hover:text-primary transition-colors">
              REGISTRAR MANUTENÇÃO
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm">
          <h3 className="font-display text-xs mb-4">QR Code de Rastreio</h3>
          <div className="bg-foreground p-3 inline-block rounded">
            <QRCodeSVG value={qrUrl} size={128} />
          </div>
          <p className="font-mono text-[0.65rem] text-muted-foreground/50 mt-3">
            Aponte a câmera para acessar esta ficha técnica.
          </p>

          <h3 className="font-display text-xs mt-8 mb-4">Histórico de Eventos</h3>
          <div className="relative pl-7">
            <div className="absolute left-[9px] top-0 bottom-0 w-px bg-border-bright" />
            {events.map(ev => (
              <div key={ev.id} className="relative mb-5">
                <div className="absolute left-[-22px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                <div className="font-mono text-[0.65rem] text-muted-foreground/50">{ev.date}</div>
                <div className="font-mono text-xs text-primary">{ev.type}</div>
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

      <div id="print-area" style={{ display: 'none' }} />
    </>
  );
}
