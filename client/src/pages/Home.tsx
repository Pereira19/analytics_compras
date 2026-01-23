import { useState } from 'react';
import { RotateCcw, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import DataStats from '@/components/DataStats';
import DataTable from '@/components/DataTable';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import AdvancedStats from '@/components/AdvancedStats';
import DataFilters from '@/components/DataFilters';
import ExportData from '@/components/ExportData';
import Sheet4SupplierBuyer from '@/pages/Sheet4SupplierBuyer';
import Sheet2SupplierAnalysis from '@/pages/Sheet2SupplierAnalysis';
import { useExcelParser } from '@/hooks/useExcelParser';
import { useMultiSheetExcel } from '@/hooks/useMultiSheetExcel';

/**
 * Design Philosophy: Modernismo Minimalista
 * - Paleta azul-teal com tons neutros
 * - Espaço generoso e whitespace abundante
 * - Tipografia expressiva (Poppins para títulos, Inter para corpo)
 * - Cards com borda sutil no topo
 * - Animações suaves e transições fluidas
 */
export default function Home() {
  const { data: singleSheetData, error: singleError, isLoading: singleLoading, parseExcel: parseSingle, clearData: clearSingle } = useExcelParser();
  const { data: multiSheetData, error: multiError, isLoading: multiLoading, parseExcel: parseMulti, clearData: clearMulti } = useMultiSheetExcel();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [filteredData, setFilteredData] = useState<typeof singleSheetData>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'multi'>('single');

  const handleFileSelect = async (file: File) => {
    setShowSuccess(false);
    setActiveTab(null);
    
    // Tentar carregar múltiplas abas primeiro
    const multiResult = await parseMulti(file);
    if (multiResult) {
      setMode('multi');
      setActiveTab('sheet4');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      // Fallback para single sheet
      const singleResult = await parseSingle(file);
      if (singleResult) {
        setMode('single');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  const handleReset = () => {
    clearSingle();
    clearMulti();
    setFilteredData(null);
    setActiveTab(null);
    setShowSuccess(false);
    setMode('single');
  };

  const handleFilterChange = (newData: any) => {
    setFilteredData(newData);
  };

  const isLoading = singleLoading || multiLoading;
  const error = singleError || multiError;
  const hasData = singleSheetData || multiSheetData;

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
            {hasData && (
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
        {!hasData ? (
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
                  title: 'Múltiplas Abas',
                  description: 'Processa automaticamente todas as abas'
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
          <div className="space-y-8">
            {/* Tabs Navigation */}
            {mode === 'multi' && multiSheetData && (
              <div className="flex gap-2 flex-wrap bg-white rounded-lg p-4 shadow-sm border border-border">
                {multiSheetData.sheetNames.map((sheetName, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(sheetName)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === sheetName
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {sheetName}
                  </button>
                ))}
              </div>
            )}

            {/* Content based on mode and active tab */}
            {mode === 'multi' && multiSheetData ? (
              <>
                {activeTab === 'ANALISE FORNECEDOR' && (
                  <Sheet2SupplierAnalysis />
                )}
                {activeTab === 'FORNECEDORES X COMPRADOR' && (
                  <Sheet4SupplierBuyer />
                )}
                {!activeTab && (
                  <div className="text-center py-12">
                    <Grid3x3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma aba acima para visualizar os dados
                    </p>
                  </div>
                )}
              </>
            ) : (
              // Single sheet mode
              <>
                {/* Stats Cards */}
                <DataStats data={singleSheetData!} />

                {/* Advanced Statistics */}
                <AdvancedStats data={singleSheetData!} />

                {/* Filters */}
                <DataFilters data={singleSheetData!} onFilterChange={handleFilterChange} />

                {/* Charts */}
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-6">
                    Visualizações
                  </h3>
                  <AnalyticsCharts data={filteredData || singleSheetData!} />
                </div>

                {/* Export */}
                <ExportData data={filteredData || singleSheetData!} />

                {/* Data Table */}
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-6">
                    Dados Detalhados
                  </h3>
                  <DataTable data={filteredData || singleSheetData!} />
                </div>
              </>
            )}
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
