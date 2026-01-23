import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface MonthFilterContainerProps {
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
}

const MONTHS = [
  { key: 'JAN', label: 'Janeiro', short: 'Jan' },
  { key: 'FEV', label: 'Fevereiro', short: 'Fev' },
  { key: 'MAR', label: 'Março', short: 'Mar' },
  { key: 'ABR', label: 'Abril', short: 'Abr' },
  { key: 'MAI', label: 'Maio', short: 'Mai' },
  { key: 'JUN', label: 'Junho', short: 'Jun' },
  { key: 'JUL', label: 'Julho', short: 'Jul' },
  { key: 'AGO', label: 'Agosto', short: 'Ago' },
  { key: 'SET', label: 'Setembro', short: 'Set' },
  { key: 'OUT', label: 'Outubro', short: 'Out' },
  { key: 'NOV', label: 'Novembro', short: 'Nov' },
  { key: 'DEZ', label: 'Dezembro', short: 'Dez' }
];

export default function MonthFilterContainer({ selectedMonth, onMonthChange }: MonthFilterContainerProps) {
  const displayLabel = useMemo(() => {
    if (!selectedMonth) return 'Todos os meses';
    const month = MONTHS.find(m => m.key === selectedMonth);
    return month ? month.label : 'Todos os meses';
  }, [selectedMonth]);

  return (
    <div className="card-metric bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Ícone e Título */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-semibold text-foreground">Filtrar por Mês:</span>
        </div>

        {/* Grid de Botões de Meses */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => onMonthChange(null)}
            variant={selectedMonth === null ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            Todos
          </Button>
          
          {MONTHS.map((month) => (
            <Button
              key={month.key}
              onClick={() => onMonthChange(month.key)}
              variant={selectedMonth === month.key ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              title={month.label}
            >
              {month.short}
            </Button>
          ))}
        </div>

        {/* Display do Mês Selecionado */}
        <div className="ml-auto text-sm font-semibold text-amber-700 bg-white px-3 py-1 rounded-lg border border-amber-200">
          {displayLabel}
        </div>
      </div>
    </div>
  );
}
