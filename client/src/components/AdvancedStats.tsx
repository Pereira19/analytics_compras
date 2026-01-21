import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { ParsedData } from '@/hooks/useExcelParser';

interface AdvancedStatsProps {
  data: ParsedData;
}

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export default function AdvancedStats({ data }: AdvancedStatsProps) {
  const stats = useMemo(() => {
    const numericCols = data.stats.numericColumns;
    
    if (numericCols.length === 0) {
      return [];
    }

    const stats: StatCard[] = [];
    
    // Calcular estatísticas para cada coluna numérica
    numericCols.slice(0, 3).forEach((col, idx) => {
      const values = data.rows
        .map(row => Number(row[col]))
        .filter(val => !isNaN(val) && val !== null);

      if (values.length === 0) return;

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      // Calcular tendência (comparar primeira metade com segunda metade)
      const midpoint = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, midpoint);
      const secondHalf = values.slice(midpoint);
      
      const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const trend = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;

      const colors = ['from-blue-500 to-cyan-500', 'from-cyan-500 to-teal-500', 'from-teal-500 to-green-500'];

      stats.push({
        label: `Média - ${col}`,
        value: avg.toFixed(2),
        change: Math.round(trend),
        icon: trend > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
        color: colors[idx % colors.length]
      });
    });

    return stats;
  }, [data]);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold text-foreground mb-6">
        Análise Estatística
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card-metric">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
            {stat.change !== undefined && (
              <div className={`text-xs font-semibold ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change}% vs período anterior
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
