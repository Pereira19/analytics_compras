import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductFilters from '@/components/ProductFilters';
import ProductAnalysisKPIs from '@/components/ProductAnalysisKPIs';
import ProductAnalysisCharts from '@/components/ProductAnalysisCharts';
import { useSheet1Data, Sheet1Record } from '@/hooks/useSheet1Data';

const ROWS_PER_PAGE = 20;

interface Sheet1ProductAnalysisProps {
  selectedMonth?: string | null;
}

export default function Sheet1ProductAnalysis({ selectedMonth }: Sheet1ProductAnalysisProps) {
  const { data, isLoading, error } = useSheet1Data();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState<string | null>(null);
  const [selectedComprador, setSelectedComprador] = useState<string | null>(null);
  const [selectedCurva, setSelectedCurva] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    let filtered = data;

    // Aplicar filtros
    if (selectedFornecedor) {
      filtered = filtered.filter(row => row.FORNECEDOR === selectedFornecedor);
    }
    if (selectedComprador) {
      filtered = filtered.filter(row => row.COMPRADOR === selectedComprador);
    }
    if (selectedCurva) {
      filtered = filtered.filter(row => row['CURVA ABC'] === selectedCurva);
    }

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [data, selectedFornecedor, selectedComprador, selectedCurva, searchTerm]);

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

  const headers = ['CÓDIGO', 'DESCRIÇÃO', 'FORNECEDOR', 'COMPRADOR', 'CURVA ABC', 'ESTOQUE', 'GIRO MENSAL', 'PENDENTE'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Análise de Produtos
        </h2>
        <p className="text-muted-foreground">
          Catálogo de {data.length.toLocaleString('pt-BR')} produtos com análise de estoque, giro e curva ABC
        </p>
      </div>

      {/* KPIs */}
      <ProductAnalysisKPIs data={data} />

      {/* Filtros */}
      <ProductFilters
        data={data}
        selectedFornecedor={selectedFornecedor}
        selectedComprador={selectedComprador}
        selectedCurva={selectedCurva}
        onFornecedorChange={setSelectedFornecedor}
        onCompradorChange={setSelectedComprador}
        onCurvaChange={setSelectedCurva}
      />

      {/* Gráficos */}
      <ProductAnalysisCharts data={filteredRows} />

      {/* Tabela Detalhada */}
      <div className="card-metric">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Produtos ({filteredRows.length})
          </h3>
          <Input
            type="text"
            placeholder="Buscar por código, descrição..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-80"
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
                  <td className="px-4 py-3 text-foreground font-mono text-xs">
                    {row['Código Produto']}
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-xs truncate">
                    {row.DESCRIÇÃO}
                  </td>
                  <td className="px-4 py-3 text-foreground text-xs">
                    {row.FORNECEDOR}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {row.COMPRADOR}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      row['CURVA ABC'] === 'A' ? 'bg-green-100 text-green-800' :
                      row['CURVA ABC'] === 'B' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {row['CURVA ABC'] || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground text-right">
                    {Number(row['ESTOQUE DISPONÍVEL'] || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-foreground text-right">
                    {Number(row['GIRO MÉDIO MENSAL'] || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-foreground text-right">
                    {Number(row['QUANTIDADE PEDIDA PENDENTE'] || 0).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages} ({filteredRows.length} produtos)
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
