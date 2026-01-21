import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import DataStats from '@/components/DataStats';
import DataTable from '@/components/DataTable';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import AdvancedStats from '@/components/AdvancedStats';
import DataFilters from '@/components/DataFilters';
import ExportData from '@/components/ExportData';
import { useExcelParser } from '@/hooks/useExcelParser';

/**
 * Design Philosophy: Modernismo Minimalista
 * - Paleta azul-teal com tons neutros
 * - Espaço generoso e whitespace abundante
 * - Tipografia expressiva (Poppins para títulos, Inter para corpo)
 * - Cards com borda sutil no topo
 * - Animações suaves e transições fluidas
 */
export default function Home() {
  const { data, error, isLoading, parseExcel, clearData } = useExcelParser();
  const [showSuccess, setShowSuccess] = useState(false);
  const [filteredData, setFilteredData] = useState<typeof data>(null);

  const handleFileSelect = async (file: File) => {
    setShowSuccess(false);
    const result = await parseExcel(file);
    if (result) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    clearData();
    setFilteredData(null);
    setShowSuccess(false);
  };

  const handleFilterChange = (newData: any) => {
    setFilteredData(newData);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Análise de dados em tempo real
                </p>
              </div>
            </div>
            {data && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Novo Arquivo
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {!data ? (
          // Upload Section
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Bem-vindo à sua Dashboard
              </h2>
              <p className="text-lg text-muted-foreground">
                Carregue um arquivo Excel para começar a análise de dados
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              error={error?.message}
              success={showSuccess}
            />

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              {[
                {
                  title: 'Formatos Suportados',
                  description: 'Excel (.xlsx, .xls) e CSV'
                },
                {
                  title: 'Processamento Rápido',
                  description: 'Análise instantânea de seus dados'
                },
                {
                  title: 'Gráficos Interativos',
                  description: 'Visualizações dinâmicas e intuitivas'
                }
              ].map((item, idx) => (
                <div key={idx} className="card-metric text-center">
                  <h3 className="font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Dashboard Section
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Análise de Dados
              </h2>
              <p className="text-muted-foreground">
                Visualize e explore seus dados com gráficos interativos
              </p>
            </div>

            {/* Stats Cards */}
            <DataStats data={data} />

            {/* Advanced Statistics */}
            <AdvancedStats data={data} />

            {/* Filters */}
            <DataFilters data={data} onFilterChange={handleFilterChange} />

            {/* Charts */}
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Visualizações
              </h3>
              <AnalyticsCharts data={filteredData || data} />
            </div>

            {/* Export */}
            <ExportData data={filteredData || data} />

            {/* Data Table */}
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Dados Detalhados
              </h3>
              <DataTable data={filteredData || data} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white/50 backdrop-blur-sm mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>
            Analytics Dashboard • Processamento seguro de dados locais
          </p>
        </div>
      </footer>
    </div>
  );
}
