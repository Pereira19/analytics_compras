import { useMemo, useState, useContext } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BuyerAnalysisKPIs from '@/components/BuyerAnalysisKPIs';
import BuyerAnalysisCharts from '@/components/BuyerAnalysisCharts';
import ExportPDFButton from '@/components/ExportPDFButton';
import { usePeriodFilter, getPeriodLabel } from '@/contexts/PeriodFilterContext';

interface Sheet3BuyerAnalysisProps {
  selectedMonth?: string | null;
}

interface BuyerRecord {
  COD: number;
  COMPRADOR: string;
  NIVEL_SERVICO_S_PENDENCIA: number | null;
  NIVEL_SERVICO_C_PENDENCIA: number | null;
  RUPTURA_TOTAL: number;
  EXCESSO_TOTAL: number;
  VALOR_ESTOQUE_VENDA: number;
  SKU_INDUSTRIA: number;
  SKU_ATIVOS: number;
  PMP: number | null;
  PRAZO_CLIENTE: number | null;
  VALOR_VENDA_ATUAL: number;
  VALOR_VENDA_PROJETADA: number;
  PROJETO: number;
  PROJETO_PERCENTUAL: number;
  LUCRO_PROJETO: number;
  LUCRO_REALIZADO: number;
  LUCRO_PERCENTUAL: number;
}

const ROWS_PER_PAGE = 15;

export default function Sheet3BuyerAnalysis() {
  const [data, setData] = useState<BuyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { periodFilter } = usePeriodFilter();

  // Carregar dados
  useMemo(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/sheet3_data_complete.json');
        if (!response.ok) throw new Error('Erro ao carregar dados');
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  const periodLabel = getPeriodLabel(periodFilter);

  const headers = [
    'COD',
    'COMPRADOR',
    'SKU INDUSTRIA',
    'ATIVOS',
    'PMP',
    'PRAZO CLIENTE',
    'VALOR VENDA ATUAL',
    'VALOR VENDA PROJETADA',
    'LUCRO REALIZADO',
    '% LUCRO'
  ];

  // Gerar conteúdo HTML para exportação
  const generateTableHTML = () => {
    let html = '<table><thead><tr>';
    headers.forEach(h => {
      html += `<th>${h}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    currentRows.forEach(row => {
      html += '<tr>';
      headers.forEach(header => {
        let value = '';
        
        if (header === 'COD') value = String(row.COD);
        else if (header === 'COMPRADOR') value = row.COMPRADOR;
        else if (header === 'SKU INDUSTRIA') value = String(row.SKU_INDUSTRIA || '-');
        else if (header === 'ATIVOS') value = String(row.SKU_ATIVOS || '-');
        else if (header === 'PMP') value = row.PMP ? `R$ ${(row.PMP / 1000000).toFixed(2)}M` : '-';
        else if (header === 'PRAZO CLIENTE') value = row.PRAZO_CLIENTE ? `${row.PRAZO_CLIENTE} dias` : '-';
        else if (header === 'VALOR VENDA ATUAL') value = `R$ ${(row.VALOR_VENDA_ATUAL / 1000000).toFixed(2)}M`;
        else if (header === 'VALOR VENDA PROJETADA') value = `R$ ${(row.VALOR_VENDA_PROJETADA / 1000000).toFixed(2)}M`;
        else if (header === 'LUCRO REALIZADO') value = `R$ ${(row.LUCRO_REALIZADO / 1000000).toFixed(2)}M`;
        else if (header === '% LUCRO') value = `${(row.LUCRO_PERCENTUAL * 100).toFixed(2)}%`;
        
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Análise de Compradores
        </h2>
        <p className="text-muted-foreground">
          Métricas de desempenho, vendas e lucro por comprador
        </p>
      </div>

      {/* Informação de Período */}
      <div className="card-metric bg-blue-50 border border-blue-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Período Selecionado: {periodLabel}</p>
          <p className="text-xs text-blue-700 mt-1">Os dados desta aba incluem métricas de vendas, lucro e desempenho por comprador.</p>
        </div>
      </div>

      {/* KPIs */}
      <BuyerAnalysisKPIs data={data as any} />

      {/* Gráficos */}
      <BuyerAnalysisCharts data={data as any} />

      {/* Tabela Detalhada */}
      <div className="card-metric">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            Dados Detalhados ({filteredRows.length})
          </h3>
          <div className="flex gap-2">
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
            <ExportPDFButton
              title={`Análise de Compradores - ${periodLabel}`}
              fileName={`analise_compradores_${periodLabel.replace(/\//g, '-')}`}
              content={generateTableHTML()}
            />
          </div>
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
                  <td className="px-4 py-3 text-foreground">{row.COD}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{row.COMPRADOR}</td>
                  <td className="px-4 py-3 text-foreground">{row.SKU_INDUSTRIA || '-'}</td>
                  <td className="px-4 py-3 text-foreground">{row.SKU_ATIVOS || '-'}</td>
                  <td className="px-4 py-3 text-foreground">
                    {row.PMP ? `R$ ${(row.PMP / 1000000).toFixed(2)}M` : '-'}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {row.PRAZO_CLIENTE ? `${row.PRAZO_CLIENTE} dias` : '-'}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    R$ {(row.VALOR_VENDA_ATUAL / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    R$ {(row.VALOR_VENDA_PROJETADA / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    R$ {(row.LUCRO_REALIZADO / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {(row.LUCRO_PERCENTUAL * 100).toFixed(2)}%
                  </td>
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
