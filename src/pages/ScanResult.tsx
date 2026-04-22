import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { PageHeader } from '@/components/PageHeader';
import { Equipment } from '@/lib/types';
import { Wrench, ArrowRightLeft, ShieldCheck, Info, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScanResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eq, setEq] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

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

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [eq?.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
      <div className="animate-pulse">
        <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto mb-4" />
        <h1 className="font-display text-lg">Buscando informações do ativo...</h1>
      </div>
    </div>
  );

  if (!eq) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="bg-status-danger/10 p-4 rounded-full mb-4">
        <Info className="h-8 w-8 text-status-danger" />
      </div>
      <h1 className="font-display text-xl mb-2 text-foreground">Ativo não encontrado</h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        O código escaneado não corresponde a nenhum equipamento registrado no sistema.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="px-6 py-2.5 bg-primary text-primary-foreground font-display text-[0.65rem] uppercase tracking-widest hover:bg-primary/80 transition-colors"
      >
        VOLTAR AO INÍCIO
      </button>
    </div>
  );

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

  const ActionButton = ({ 
    icon: Icon, 
    label, 
    description, 
    onClick, 
    variant = 'default' 
  }: { 
    icon: LucideIcon, 
    label: string, 
    description: string, 
    onClick: () => void,
    variant?: 'default' | 'outline'
  }) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center p-4 rounded-sm text-left mb-3 group transition-all duration-200 hover:scale-[1.01] hover:shadow-md active:scale-[0.99]",
        variant === 'default' 
          ? "bg-surface border border-border hover:border-primary" 
          : "bg-background border border-border hover:bg-surface"
      )}
    >
      <div className={cn(
        "p-3 rounded-sm mr-4 transition-colors",
        variant === 'default' ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-[0.7rem] uppercase tracking-wider text-foreground mb-0.5">{label}</h3>
        <p className="text-[0.65rem] text-muted-foreground font-mono leading-tight">{description}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-primary px-6 pt-10 pb-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none">
          <ShieldCheck className="h-48 w-48" />
        </div>
        
        <div className="relative z-10">
          <p className="text-[0.6rem] font-mono uppercase tracking-[0.2em] mb-2 opacity-80">Rastreio de Ativo</p>
          <h1 className="font-display text-2xl font-bold truncate mb-3 leading-tight">{eq.nome}</h1>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-[0.55rem] font-mono uppercase">
              {eq.patrimonio}
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[0.55rem] font-mono uppercase",
              eq.status === 'Disponível' ? 'bg-status-success text-white' : 
              eq.status === 'Em Uso' ? 'bg-white text-primary' : 'bg-status-warning text-white'
            )}>
              {eq.status}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 relative z-20 mt-4">
        {selectedPhotoSrc && (
          <div className="bg-surface border border-border p-4 rounded-sm shadow-sm mb-6">
            <h2 className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-3 px-1">
              Foto do Equipamento
            </h2>
            <div className="bg-background border border-border rounded-md overflow-hidden">
              <img
                src={selectedPhotoSrc}
                alt={`Foto do equipamento ${eq.nome}`}
                className="w-full max-h-[260px] object-contain bg-background"
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

        <div className="bg-surface border border-border p-6 rounded-sm shadow-sm mb-10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[0.55rem] text-muted-foreground uppercase mb-0.5">Responsável</p>
              <p className="text-[0.7rem] font-display text-foreground truncate">{eq.responsavel || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[0.55rem] text-muted-foreground uppercase mb-0.5">Localização</p>
              <p className="text-[0.7rem] font-display text-foreground truncate">{eq.localizacao || 'N/A'}</p>
            </div>
          </div>
        </div>

        <h2 className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-4 px-1">Ações Disponíveis</h2>
        
        <ActionButton 
          icon={Wrench}
          label="Registrar Manutenção"
          description="Relatar problema técnico, troca de peças ou limpeza preventiva."
          onClick={() => navigate(`/manutencao/${eq.id}`)}
        />

        <ActionButton 
          icon={ArrowRightLeft}
          label="Transferir Ativo"
          description="Mudar o responsável ou a localização física deste equipamento."
          onClick={() => navigate(`/transferencia/${eq.id}`)}
        />

        <ActionButton 
          icon={FileText}
          label="Gerar Termo"
          description="Criar documento de responsabilidade para o colaborador."
          onClick={() => navigate(`/termo/${eq.id}`)}
          variant="outline"
        />

        <ActionButton 
          icon={Info}
          label="Ficha Completa"
          description="Ver especificações técnicas, histórico e garantias."
          onClick={() => navigate(`/equipamento/${eq.id}`)}
          variant="outline"
        />

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <button 
            onClick={() => navigate(`/equipamento/${eq.id}`)}
            className="text-[0.6rem] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            ← VOLTAR PARA A FICHA TÉCNICA
          </button>
        </div>
      </div>
    </div>
  );
}
