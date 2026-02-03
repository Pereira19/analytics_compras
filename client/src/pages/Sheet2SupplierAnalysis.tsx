import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SupplierAnalysisKPIs from '@/components/SupplierAnalysisKPIs';
import SupplierAnalysisCharts from '@/components/SupplierAnalysisCharts';
import { useSheet2Data, Sheet2Record } from '@/hooks/useSheet2Data';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';

const ROWS_PER_PAGE = 15;

interface Sheet2SupplierAnalysisProps {
  selectedMonth?: string | null;
}

export default function Sheet2SupplierAnalysis({ selectedMonth }: Sheet2SupplierAnalysisProps) {
  const { data, isLoading, error } = useSheet2Data();
  const { periodFilter } = usePeriodFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = filteredRows.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="ml-3 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-metric bg-red-50 border border-red-200">
        <p className="text-red-600 font-semibold">Erro ao carregar dados</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-metric text-center">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const periodLabel = periodFilter.type === 'month' 
    ? `${periodFilter.month}/${periodFilter.year}`
    : periodFilter.type === 'quarter'
    ? `Q${periodFilter.quarter}/${periodFilter.year}`
    : `S${periodFilter.semester}/${periodFilter.year}`;

  const headers = ['COD', 'Fornecedor', 'COMPRADOR', 'NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA', '% RUPTURA TOTAL', '% EXCESSO TOTAL', 'VALOR ESTOQUE PREÇO VENDA'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Análise de Fornecedores
        </h2>
        <p className="text-muted-foreground">
          Métricas de nível de serviço, ruptura e excesso de estoque por fornecedor
        </p>
      </div>

      {/* Informação de Período */}
      <div className="card-metric bg-blue-50 border border-blue-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Período Selecionado: {periodLabel}</p>
          <p className="text-xs text-blue-700 mt-1">Os dados desta aba são agregados. Quando dados mensais forem disponibilizados nas colunas FATURAMENTO/ENTRADA, o filtro será aplicado automaticamente.</p>
        </div>
      </div>

      {/* KPIs */}
      <SupplierAnalysisKPIs data={data} />

      {/* Gráficos */}
      <SupplierAnalysisCharts data={data} />

      {/* Tabela Compacta: Top Fornecedores por Nível de Serviço */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Top Fornecedores por Nível de Serviço
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Fornecedor</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Nível Serviço</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(row => row.Fornecedor && row.Fornecedor.trim() !== '' && String(row.COD || '').toUpperCase() !== 'TOTAL')
                .sort((a, b) => (Number(b['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0) - (Number(a['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0))
                .slice(0, 15)
                .map((row, idx) => {
                  const serviceLevel = Number(row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA'] || 0) * 100;
                  const bgColor = serviceLevel >= 90 ? 'bg-green-50' : serviceLevel >= 80 ? 'bg-yellow-50' : 'bg-red-50';
                  return (
                    <tr key={idx} className={`border-b border-border ${bgColor} hover:opacity-80 transition-opacity`}>
                      <td className="px-4 py-3 font-medium text-foreground">{String(row.Fornecedor || '-').substring(0, 20)}</td>
                      <td className="px-4 py-3 text-foreground">{serviceLevel.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-foreground">R$ {((Number(row['VALOR ESTOQUE PREÇO VENDA']) || 0) / 1000000).toFixed(2)}M</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela com Heatmap: Ruptura vs Excesso */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Análise: Ruptura vs Excesso (Heatmap)
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Cores: Azul (Ruptura Alta) | Vermelho (Excesso Alto) | Verde (Baixo Risco)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Fornecedor</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Ruptura</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Excesso</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">%Ruptura</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">%Excesso</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(row => row.Fornecedor && row.Fornecedor.trim() !== '' && String(row.COD || '').toUpperCase() !== 'TOTAL')
                .sort((a, b) => (Number(b['% RUPTURA TOTAL']) || 0) - (Number(a['% RUPTURA TOTAL']) || 0))
                .slice(0, 20)
                .map((row, idx) => {
                  const rupture = Number(row['% RUPTURA TOTAL'] || 0) * 100;
                  const excess = Number(row['% EXCESSO TOTAL'] || 0) * 100;
                  let bgColor = 'bg-green-50';
                  if (rupture > 10) bgColor = 'bg-blue-100';
                  if (excess > 30) bgColor = 'bg-red-100';
                  if (rupture > 10 && excess > 30) bgColor = 'bg-purple-100';
                  return (
                    <tr key={idx} className={`border-b border-border ${bgColor} hover:opacity-80 transition-opacity`}>
                      <td className="px-4 py-3 font-medium text-foreground">{String(row.Fornecedor || '-').substring(0, 20)}</td>
                      <td className="px-4 py-3 text-foreground">{Number(row['% RUPTURA TOTAL'] || 0).toFixed(4)}</td>
                      <td className="px-4 py-3 text-foreground">{Number(row['% EXCESSO TOTAL'] || 0).toFixed(4)}</td>
                      <td className="px-4 py-3 text-foreground font-semibold text-red-600">{rupture.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-foreground font-semibold text-orange-600">{excess.toFixed(2)}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="card-metric">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Dados Detalhados
          </h3>
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
                  {headers.map((header) => {
                    const value = row[header as keyof Sheet2Record];
                    let displayValue = String(value ?? '-');

                    if (typeof value === 'number') {
                      if (header.includes('VALOR') || header.includes('PREÇO')) {
                        displayValue = `R$ ${(value / 1000000).toFixed(2)}M`;
                      } else if (header.includes('%') || header.includes('RUPTURA') || header.includes('EXCESSO') || header.includes('SERVIÇO')) {
                        displayValue = `${(value * 100).toFixed(2)}%`;
                      }
                    }

                    return (
                      <td
                        key={`${rowIndex}-${header}`}
                        className="px-4 py-3 text-foreground"
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages} ({filteredRows.length} linhas)
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              size="sm"
              variant="outline"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
