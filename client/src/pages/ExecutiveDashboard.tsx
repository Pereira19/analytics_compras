import { useMemo } from 'react';
import { TrendingUp, Package, Users, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { useSheet1Data } from '@/hooks/useSheet1Data';
import { useSheet2Data } from '@/hooks/useSheet2Data';
import { useSheet3Data } from '@/hooks/useSheet3Data';
import { useSheet4CompleteData } from '@/hooks/useSheet4CompleteData';

/**
 * Design Philosophy: Modernismo Minimalista
 * - Dashboard executivo com foco em KPIs principais
 * - Cards com gradientes sutis e ícones informativos
 * - Grid responsivo mostrando métricas de todas as 4 abas
 * - Cores dinâmicas baseadas em performance (verde=bom, amarelo=atenção, vermelho=crítico)
 */

interface KPICard {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description?: string;
}

export default function ExecutiveDashboard() {
  const { data: sheet1Data } = useSheet1Data();
  const { data: sheet2Data } = useSheet2Data();
  const { data: sheet3Data } = useSheet3Data();
  const { data: sheet4Data } = useSheet4CompleteData();

  const kpis = useMemo(() => {
    const kpiList: KPICard[] = [];

    // ===== SHEET 1: ANÁLISE PRODUTO =====
    if (sheet1Data.length > 0) {
      const totalProducts = sheet1Data.length;
      const totalStock = sheet1Data.reduce((sum, row) => sum + (Number(row['ESTOQUE DISPONÍVEL']) || 0), 0);
      const avgMonthlyTurnover = sheet1Data.reduce((sum, row) => sum + (Number(row['GIRO MÉDIO MENSAL']) || 0), 0) / totalProducts;
      const pendingOrders = sheet1Data.reduce((sum, row) => sum + (Number(row['QUANTIDADE PEDIDA PENDENTE']) || 0), 0);

      kpiList.push(
        {
          title: 'Total de Produtos',
          value: totalProducts.toLocaleString('pt-BR'),
          icon: <Package className="w-6 h-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Catálogo completo'
        },
        {
          title: 'Estoque Total',
          value: totalStock.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
          unit: 'unidades',
          icon: <ShoppingCart className="w-6 h-6" />,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          description: 'Disponível'
        },
        {
          title: 'Giro Médio Mensal',
          value: avgMonthlyTurnover.toFixed(2),
          unit: 'unidades/mês',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Por produto'
        },
        {
          title: 'Pedidos Pendentes',
          value: pendingOrders.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
          unit: 'unidades',
          icon: <AlertCircle className="w-6 h-6" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          description: 'Aguardando entrada'
        }
      );
    }

    // ===== SHEET 2: ANÁLISE FORNECEDOR =====
    if (sheet2Data.length > 0) {
      const totalSuppliers = sheet2Data.length;
      const avgServiceLevel = sheet2Data.reduce((sum, row) => sum + (Number(row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0), 0) / totalSuppliers;
      const avgBreakageRate = sheet2Data.reduce((sum, row) => sum + (Number(row['% RUPTURA TOTAL']) || 0), 0) / totalSuppliers;
      const totalStockValue = sheet2Data.reduce((sum, row) => sum + (Number(row['VALOR ESTOQUE PREÇO VENDA']) || 0), 0);

      kpiList.push(
        {
          title: 'Total de Fornecedores',
          value: totalSuppliers.toLocaleString('pt-BR'),
          icon: <Users className="w-6 h-6" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Base de fornecimento'
        },
        {
          title: 'Nível de Serviço Médio',
          value: avgServiceLevel.toFixed(2),
          unit: '%',
          icon: <CheckCircle className="w-6 h-6" />,
          color: avgServiceLevel >= 90 ? 'text-green-600' : avgServiceLevel >= 80 ? 'text-yellow-600' : 'text-red-600',
          bgColor: avgServiceLevel >= 90 ? 'bg-green-50' : avgServiceLevel >= 80 ? 'bg-yellow-50' : 'bg-red-50',
          description: 'Desempenho'
        },
        {
          title: 'Taxa de Ruptura Média',
          value: avgBreakageRate.toFixed(2),
          unit: '%',
          icon: <AlertCircle className="w-6 h-6" />,
          color: avgBreakageRate <= 5 ? 'text-green-600' : avgBreakageRate <= 10 ? 'text-yellow-600' : 'text-red-600',
          bgColor: avgBreakageRate <= 5 ? 'bg-green-50' : avgBreakageRate <= 10 ? 'bg-yellow-50' : 'bg-red-50',
          description: 'Falta de estoque'
        },
        {
          title: 'Valor de Estoque (Venda)',
          value: (totalStockValue / 1_000_000).toFixed(2),
          unit: 'M',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          description: 'Preço venda'
        }
      );
    }

    // ===== SHEET 3: ANÁLISE COMPRADOR =====
    if (sheet3Data.length > 0) {
      const totalBuyers = sheet3Data.length;
      const avgServiceLevel = sheet3Data.reduce((sum, row) => sum + (Number(row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0), 0) / totalBuyers;
      const avgBreakageRate = sheet3Data.reduce((sum, row) => sum + (Number(row['% RUPTURA TOTAL']) || 0), 0) / totalBuyers;
      const totalSkuActive = sheet3Data.reduce((sum, row) => sum + (Number(row['SKU INDUSTRIA ATIVOS']) || 0), 0);

      kpiList.push(
        {
          title: 'Total de Compradores',
          value: totalBuyers.toLocaleString('pt-BR'),
          icon: <Users className="w-6 h-6" />,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          description: 'Canais de venda'
        },
        {
          title: 'Nível de Serviço (Comprador)',
          value: avgServiceLevel.toFixed(2),
          unit: '%',
          icon: <CheckCircle className="w-6 h-6" />,
          color: avgServiceLevel >= 90 ? 'text-green-600' : avgServiceLevel >= 80 ? 'text-yellow-600' : 'text-red-600',
          bgColor: avgServiceLevel >= 90 ? 'bg-green-50' : avgServiceLevel >= 80 ? 'bg-yellow-50' : 'bg-red-50',
          description: 'Atendimento'
        },
        {
          title: 'Taxa de Ruptura (Comprador)',
          value: avgBreakageRate.toFixed(2),
          unit: '%',
          icon: <AlertCircle className="w-6 h-6" />,
          color: avgBreakageRate <= 5 ? 'text-green-600' : avgBreakageRate <= 10 ? 'text-yellow-600' : 'text-red-600',
          bgColor: avgBreakageRate <= 5 ? 'bg-green-50' : avgBreakageRate <= 10 ? 'bg-yellow-50' : 'bg-red-50',
          description: 'Falta de estoque'
        },
        {
          title: 'SKU Ativos Indústria',
          value: totalSkuActive.toLocaleString('pt-BR'),
          icon: <Package className="w-6 h-6" />,
          color: 'text-teal-600',
          bgColor: 'bg-teal-50',
          description: 'Produtos em linha'
        }
      );
    }

    // ===== SHEET 4: FORNECEDOR × COMPRADOR =====
    if (sheet4Data.length > 0) {
      const totalCombinations = sheet4Data.length;
      const totalValue = sheet4Data.reduce((sum, row) => {
        const monthlyValue = [
          Number(row.JAN) || 0,
          Number(row.FEV) || 0,
          Number(row.MAR) || 0,
          Number(row.ABR) || 0,
          Number(row.MAI) || 0,
          Number(row.JUN) || 0,
          Number(row.JUL) || 0,
          Number(row.AGO) || 0,
          Number(row.SET) || 0,
          Number(row.OUT) || 0,
          Number(row.NOV) || 0,
          Number(row.DEZ) || 0
        ].reduce((a, b) => a + b, 0);
        return sum + monthlyValue;
      }, 0);
      const avgMargin = sheet4Data.reduce((sum, row) => sum + (Number(row['PROJETO MARGEM']) || 0), 0) / totalCombinations;
      const importantBrands = sheet4Data.filter(row => row['STATUS DA MARCA'] === 'IMPORTANTE').length;

      kpiList.push(
        {
          title: 'Combinações Fornecedor×Comprador',
          value: totalCombinations.toLocaleString('pt-BR'),
          icon: <ShoppingCart className="w-6 h-6" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          description: 'Relacionamentos'
        },
        {
          title: 'Valor Total Anual',
          value: (totalValue / 1_000_000).toFixed(2),
          unit: 'M',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Faturamento'
        },
        {
          title: 'Margem Média',
          value: avgMargin.toFixed(2),
          unit: '%',
          icon: <CheckCircle className="w-6 h-6" />,
          color: avgMargin >= 25 ? 'text-green-600' : avgMargin >= 20 ? 'text-yellow-600' : 'text-orange-600',
          bgColor: avgMargin >= 25 ? 'bg-green-50' : avgMargin >= 20 ? 'bg-yellow-50' : 'bg-orange-50',
          description: 'Rentabilidade'
        },
        {
          title: 'Marcas Importantes',
          value: importantBrands.toLocaleString('pt-BR'),
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Status ativo'
        }
      );
    }

    return kpiList;
  }, [sheet1Data, sheet2Data, sheet3Data, sheet4Data]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Dashboard Executivo
        </h2>
        <p className="text-muted-foreground">
          Visão consolidada de todas as análises - Produtos, Fornecedores, Compradores e Relacionamentos
        </p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`${kpi.bgColor} rounded-lg p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md`}
          >
            {/* Ícone */}
            <div className={`${kpi.color} mb-4 inline-flex p-3 rounded-lg bg-white/50`}>
              {kpi.icon}
            </div>

            {/* Título */}
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {kpi.title}
            </h3>

            {/* Valor Principal */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className={`text-3xl font-bold ${kpi.color}`}>
                {kpi.value}
              </span>
              {kpi.unit && (
                <span className="text-sm font-medium text-muted-foreground">
                  {kpi.unit}
                </span>
              )}
            </div>

            {/* Descrição */}
            {kpi.description && (
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Resumo de Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          📊 Insights Rápidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Produtos em Catálogo</p>
              <p className="text-xs text-muted-foreground">
                {sheet1Data.length > 0 ? `${sheet1Data.length.toLocaleString('pt-BR')} SKUs` : 'Carregando...'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Rede de Fornecimento</p>
              <p className="text-xs text-muted-foreground">
                {sheet2Data.length > 0 ? `${sheet2Data.length} fornecedores` : 'Carregando...'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Canais de Venda</p>
              <p className="text-xs text-muted-foreground">
                {sheet3Data.length > 0 ? `${sheet3Data.length} compradores` : 'Carregando...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dica de Navegação */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            💡 Dica: Use as abas acima para explorar análises detalhadas de cada dimensão
          </p>
          <p className="text-xs text-amber-800 mt-1">
            Clique em "Análise Produto", "Análise Fornecedor", "Análise Comprador" ou "Fornecedor × Comprador" para ver gráficos e filtros avançados.
          </p>
        </div>
      </div>
    </div>
  );
}
