import { BarChart3, Database, Columns3 } from 'lucide-react';
import { ParsedData } from '@/hooks/useExcelParser';

interface DataStatsProps {
  data: ParsedData;
}

export default function DataStats({ data }: DataStatsProps) {
  const stats = [
    {
      label: 'Total de Linhas',
      value: data.stats.totalRows.toLocaleString('pt-BR'),
      icon: Database,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Colunas',
      value: data.headers.length,
      icon: Columns3,
      color: 'from-cyan-500 to-teal-500'
    },
    {
      label: 'Colunas Numéricas',
      value: data.stats.numericColumns.length,
      icon: BarChart3,
      color: 'from-teal-500 to-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="card-metric group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
