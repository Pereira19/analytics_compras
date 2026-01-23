import { useState } from 'react';
import { RotateCcw, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sheet4SupplierBuyer from '@/pages/Sheet4SupplierBuyer';
import Sheet2SupplierAnalysis from '@/pages/Sheet2SupplierAnalysis';
import Sheet3BuyerAnalysis from '@/pages/Sheet3BuyerAnalysis';
import Sheet1ProductAnalysis from '@/pages/Sheet1ProductAnalysis';
import GlobalPeriodFilter from '@/components/GlobalPeriodFilter';

/**
 * Design Philosophy: Modernismo Minimalista
 * - Paleta azul-teal com tons neutros
 * - Espaço generoso e whitespace abundante
 * - Tipografia expressiva (Poppins para títulos, Inter para corpo)
 * - Cards com borda sutil no topo
 * - Animações suaves e transições fluidas
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('FORNECEDORES X COMPRADOR');

  const tabs = [
    { id: 'FORNECEDORES X COMPRADOR', label: 'Fornecedor × Comprador', component: Sheet4SupplierBuyer },
    { id: 'ANALISE FORNECEDOR', label: 'Análise Fornecedor', component: Sheet2SupplierAnalysis },
    { id: 'ANALISE COMPRADOR', label: 'Análise Comprador', component: Sheet3BuyerAnalysis },
    { id: 'ANALISE PRODUTO', label: 'Análise Produto', component: Sheet1ProductAnalysis }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-8">
          {/* Tabs Navigation */}
          <div className="flex gap-2 flex-wrap bg-white rounded-lg p-4 shadow-sm border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtro Global de Período */}
          <GlobalPeriodFilter />

          {/* Content */}
          {ActiveComponent && (
            <div className="animate-in fade-in duration-300">
              <ActiveComponent />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
