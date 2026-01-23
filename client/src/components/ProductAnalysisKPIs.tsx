import { useMemo } from 'react';
import { Package, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { Sheet1Record } from '@/hooks/useSheet1Data';

interface ProductAnalysisKPIsProps {
  data: Sheet1Record[];
}

export default function ProductAnalysisKPIs({ data }: ProductAnalysisKPIsProps) {
  const kpis = useMemo(() => {
    let totalProducts = 0;
    let totalStock = 0;
    let totalGiro = 0;
    let pendingOrders = 0;
    let validCount = 0;

    data.forEach((row: Sheet1Record) => {
      const stock = Number(row['ESTOQUE DISPONÍVEL']) || 0;
      const giro = Number(row['GIRO MÉDIO MENSAL']) || 0;
      const pending = Number(row['QUANTIDADE PEDIDA PENDENTE']) || 0;

      totalProducts++;
      totalStock += stock;
      totalGiro += giro;
      pendingOrders += pending;
      
      if (stock > 0 || giro > 0) {
        validCount++;
      }
    });

    const avgGiro = validCount > 0 ? totalGiro / validCount : 0;

    return [
      {
        label: 'Total de Produtos',
        value: totalProducts.toLocaleString('pt-BR'),
        icon: Package,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        label: 'Estoque Total',
        value: totalStock.toLocaleString('pt-BR'),
        icon: BarChart3,
        color: 'from-green-500 to-emerald-500'
      },
      {
        label: 'Giro Médio Mensal',
        value: avgGiro.toFixed(2),
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500'
      },
      {
        label: 'Pedidos Pendentes',
        value: pendingOrders.toLocaleString('pt-BR'),
        icon: AlertCircle,
        color: 'from-orange-500 to-red-500'
      }
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="card-metric group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
