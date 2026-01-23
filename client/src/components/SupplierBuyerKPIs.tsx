import { useMemo } from 'react';
import { Users, Building2, TrendingUp, Zap } from 'lucide-react';
import { Sheet4Record } from '@/hooks/useSheet4Data';

interface SupplierBuyerKPIsProps {
  data: Sheet4Record[];
}

export default function SupplierBuyerKPIs({ data }: SupplierBuyerKPIsProps) {
  const kpis = useMemo(() => {
    const suppliers = new Set<string>();
    const buyers = new Set<string>();
    let totalValue = 0;
    let totalMargin = 0;
    const buyerValues: Record<string, number> = {};

    data.forEach((row: Sheet4Record) => {
      const supplier = String(row['FORNECEDOR RESUMIDO'] || '').trim();
      const buyer = String(row['COMPRADOR RESUMIDO'] || '').trim();
      const value = Number(row['PROJETO VALOR']) || 0;
      const margin = Number(row['PROJETO MARGEM']) || 0;

      if (supplier && buyer) {
        suppliers.add(supplier);
        buyers.add(buyer);
        totalValue += value;
        totalMargin += margin;
        buyerValues[buyer] = (buyerValues[buyer] || 0) + value;
      }
    });

    // Encontrar comprador com maior valor
    const topBuyer = Object.entries(buyerValues).sort(([, a], [, b]) => b - a)[0];

    return [
      {
        label: 'Total de Fornecedores',
        value: suppliers.size,
        icon: Building2,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        label: 'Total de Compradores',
        value: buyers.size,
        icon: Users,
        color: 'from-cyan-500 to-teal-500'
      },
      {
        label: 'Valor Total Projeto',
        value: `R$ ${(totalValue / 1000000).toFixed(1)}M`,
        icon: TrendingUp,
        color: 'from-teal-500 to-green-500'
      },
      {
        label: `Maior Comprador: ${topBuyer?.[0] || 'N/A'}`,
        value: `R$ ${(topBuyer?.[1] / 1000000 || 0).toFixed(1)}M`,
        icon: Zap,
        color: 'from-green-500 to-emerald-500'
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
