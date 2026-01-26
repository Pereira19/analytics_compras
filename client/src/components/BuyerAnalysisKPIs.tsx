import { useMemo } from 'react';
import { TrendingUp, AlertCircle, Package, DollarSign } from 'lucide-react';
import { Sheet3Record } from '@/hooks/useSheet3Data';

interface BuyerAnalysisKPIsProps {
  data: Sheet3Record[];
}

export default function BuyerAnalysisKPIs({ data }: BuyerAnalysisKPIsProps) {
  const kpis = useMemo(() => {
    let avgServiceLevel = 0;
    let avgRupturePercent = 0;
    let avgExcessPercent = 0;
    let totalInventoryValue = 0;

    // Calcular totais para todos os registros
    data.forEach((row: Sheet3Record) => {
      const serviceLevel = Number(row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0;
      const rupturePercent = Number(row['% RUPTURA TOTAL']) || 0;
      const excessPercent = Number(row['% EXCESSO TOTAL']) || 0;
      const inventoryValue = Number(row['VALOR ESTOQUE PREÇO VENDA']) || 0;

      avgServiceLevel += serviceLevel;
      avgRupturePercent += rupturePercent;
      avgExcessPercent += excessPercent;
      totalInventoryValue += inventoryValue;
    });

    const count = data.length || 1;
    // Valores já vêm em escala 0-1, multiplicar por 100 para percentual
    avgServiceLevel = (avgServiceLevel / count) * 100;
    avgRupturePercent = (avgRupturePercent / count) * 100;
    avgExcessPercent = (avgExcessPercent / count) * 100;

    return [
      {
        label: 'Nível de Serviço Médio',
        value: `${avgServiceLevel.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'from-green-500 to-emerald-500',
        status: avgServiceLevel >= 85 ? 'good' : avgServiceLevel >= 75 ? 'warning' : 'critical'
      },
      {
        label: 'Ruptura Média',
        value: `${avgRupturePercent.toFixed(2)}%`,
        icon: AlertCircle,
        color: 'from-red-500 to-orange-500',
        status: avgRupturePercent <= 5 ? 'good' : avgRupturePercent <= 10 ? 'warning' : 'critical'
      },
      {
        label: 'Excesso Médio',
        value: `${avgExcessPercent.toFixed(2)}%`,
        icon: Package,
        color: 'from-yellow-500 to-orange-500',
        status: avgExcessPercent <= 5 ? 'good' : avgExcessPercent <= 10 ? 'warning' : 'critical'
      },
      {
        label: 'Valor Total Estoque',
        value: `R$ ${(totalInventoryValue / 1000000).toFixed(1)}M`,
        icon: DollarSign,
        color: 'from-blue-500 to-cyan-500'
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
