import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SupplierBuyerKPIs from '@/components/SupplierBuyerKPIs';
import SupplierBuyerHeatmap from '@/components/SupplierBuyerHeatmap';
import SupplierBuyerCharts from '@/components/SupplierBuyerCharts';
import { useSheet4Data, Sheet4Record } from '@/hooks/useSheet4Data';

const ROWS_PER_PAGE = 15;

export default function Sheet4SupplierBuyer() {
  const { data, isLoading, error } = useSheet4Data();
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

  const headers = ['COD', 'FORNECEDOR', 'COMPRADOR 01/26', 'FORNECEDOR RESUMIDO', 'COMPRADOR RESUMIDO', 'STATUS DA MARCA', 'PROJETO MARGEM', 'PROJETO VALOR'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Matriz Fornecedores × Compradores
        </h2>
        <p className="text-muted-foreground">
          Análise cruzada de fornecedores e compradores com valores de projeto
        </p>
      </div>

      {/* KPIs */}
      <SupplierBuyerKPIs data={data} />

      {/* Heatmap */}
      <SupplierBuyerHeatmap data={data} />

      {/* Gráficos */}
      <SupplierBuyerCharts data={data} />

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
                  {headers.map((header) => (
                    <td
                      key={`${rowIndex}-${header}`}
                      className="px-4 py-3 text-foreground"
                    >
                      {typeof row[header] === 'number' && header.includes('VALOR')
                        ? `R$ ${(row[header] / 1000000).toFixed(2)}M`
                        : typeof row[header] === 'number' && header.includes('MARGEM')
                        ? `${(row[header] * 100).toFixed(1)}%`
                        : String(row[header] ?? '-')}
                    </td>
                  ))}
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
