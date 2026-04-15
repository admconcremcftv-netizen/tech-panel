import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import logoCompleto from '@/assets/logo-tagline.png';
import { Equipment } from '@/lib/types';

export default function TermoResponsabilidade() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eq, setEq] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (id) {
        const data = await SupabaseService.getEquipment(id);
        setEq(data);
        if (data) {
          document.title = `Termo_Responsabilidade_${data.patrimonio}_${data.responsavel}`;
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center"><h1>Carregando termo...</h1></div>;
  if (!eq) return <div className="p-8 text-center"><h1>Equipamento não encontrado</h1></div>;

  const handlePrint = () => {
    window.print();
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Barra de Ações - Oculta na Impressão */}
      <div className="max-w-[800px] mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={handlePrint} className="gap-2 bg-primary hover:bg-primary-hover">
          <Printer className="h-4 w-4" /> Imprimir Termo
        </Button>
      </div>

      {/* Documento */}
      <div className="max-w-[800px] mx-auto bg-white shadow-xl p-12 md:p-16 border border-border print:shadow-none print:border-none print:p-8 text-black font-serif">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center mb-10 border-b-2 border-primary pb-6 text-center">
          <img src={logoCompleto} alt="Logo Concrem" className="h-16 object-contain mb-4" />
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black">Termo de Responsabilidade e Comodato</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de Ativos de TI - Departamento de Tecnologia</p>
        </div>

        {/* Corpo do Texto */}
        <div className="space-y-6 text-justify leading-relaxed text-[15px]">
          <p>
            Pelo presente instrumento, eu, <strong className="border-b border-black px-2">{eq.responsavel || '_________________________________'}</strong>, 
            doravante denominado(a) <strong>USUÁRIO(A)</strong>, declaro ter recebido da empresa <strong>CONCREM</strong>, 
            a título de comodato para uso exclusivo em atividades profissionais, o equipamento de informática descrito abaixo:
          </p>

          {/* Tabela de Especificações */}
          <div className="border border-black rounded-lg overflow-hidden my-8">
            <div className="bg-muted/30 border-b border-black p-2 font-bold text-center uppercase text-xs tracking-wider">
              Especificações do Equipamento
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black font-bold w-1/3">Equipamento:</td>
                  <td className="p-2">{eq.nome}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black font-bold">Patrimônio:</td>
                  <td className="p-2">{eq.patrimonio}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black font-bold">Marca/Modelo:</td>
                  <td className="p-2">{eq.marca} / {eq.modelo}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black font-bold">Nº de Série:</td>
                  <td className="p-2">{eq.serie}</td>
                </tr>
                {eq.processador && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Processador:</td>
                    <td className="p-2">{eq.processador}</td>
                  </tr>
                )}
                {eq.ram && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Memória RAM:</td>
                    <td className="p-2">{eq.ram}</td>
                  </tr>
                )}
                {eq.armazenamento && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Armazenamento:</td>
                    <td className="p-2">{eq.armazenamento}</td>
                  </tr>
                )}
                {eq.voltagem && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Voltagem:</td>
                    <td className="p-2">{eq.voltagem}</td>
                  </tr>
                )}
                {eq.polegadas && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Polegadas:</td>
                    <td className="p-2">{eq.polegadas}</td>
                  </tr>
                )}
                {eq.numeroTelefone && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Nº Telefone:</td>
                    <td className="p-2">{eq.numeroTelefone}</td>
                  </tr>
                )}
                {eq.so && (
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">Sistema Operacional:</td>
                    <td className="p-2">{eq.so}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 border-r border-black font-bold">Status:</td>
                  <td className="p-2">{eq.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <p className="font-bold uppercase text-xs border-b border-black pb-1 mb-2">Cláusulas de Responsabilidade:</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px]">
              <li>O equipamento destina-se única e exclusivamente ao uso profissional no desempenho das funções do(a) Usuário(a).</li>
              <li>O(A) Usuário(a) assume total responsabilidade pela guarda, conservação e uso adequado do equipamento.</li>
              <li>Em caso de danos causados por negligência, imprudência ou mau uso, o(a) Usuário(a) autoriza desde já o ressarcimento dos custos de reparo ou reposição.</li>
              <li>O(A) Usuário(a) compromete-se a não instalar softwares não autorizados ou realizar modificações no hardware do equipamento.</li>
              <li>Em caso de desligamento da empresa, o equipamento deverá ser devolvido imediatamente ao departamento de TI em perfeito estado de funcionamento.</li>
              <li>A perda, roubo ou furto do equipamento deve ser comunicada imediatamente ao departamento de TI, acompanhada do respectivo Boletim de Ocorrência.</li>
            </ol>
          </div>

          <p className="mt-8">
            Declaro estar ciente e de acordo com todas as cláusulas acima descritas, assumindo a responsabilidade civil e criminal pela guarda e conservação do patrimônio da empresa.
          </p>
        </div>

        {/* Assinaturas */}
        <div className="mt-20 space-y-16">
          <div className="text-right">
            <p>Dom Eliseu - Pará, {dataAtual}.</p>
          </div>

          <div className="flex flex-col items-center pt-12 space-y-16">
            {/* Campo de Assinatura */}
            <div className="w-full max-w-[400px] border-t border-black pt-2 text-center">
              <p className="font-bold text-sm uppercase">Assinatura do Usuário / Recebedor</p>
            </div>
            
            {/* Campo de CPF */}
            <div className="w-full max-w-[400px] border-t border-black pt-2 text-center">
              <p className="font-bold text-sm uppercase">CPF</p>
            </div>
          </div>
        </div>

        {/* Rodapé da Página Impressa */}
        <div className="hidden print:block fixed bottom-0 left-0 right-0 text-center text-[10px] text-muted-foreground border-t border-muted pt-2 italic">
          Documento gerado eletronicamente pelo Core-Tech Asset System - {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
