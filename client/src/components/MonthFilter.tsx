import { Button } from '@/components/ui/button';

const MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_KEYS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

interface MonthFilterProps {
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
}

export default function MonthFilter({ selectedMonth, onMonthChange }: MonthFilterProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm font-medium whitespace-nowrap text-foreground">Filtrar por Mês:</span>
        <button
          onClick={() => onMonthChange('Todos')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
            selectedMonth === 'Todos'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
              : 'bg-secondary border hover:bg-secondary/80'
          }`}
        >
          Todos
        </button>
        {MESES_NOMES.map((mes, idx) => (
          <button
            key={idx}
            onClick={() => onMonthChange(MESES_KEYS[idx])}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
              selectedMonth === MESES_KEYS[idx]
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                : 'bg-secondary border hover:bg-secondary/80'
            }`}
          >
            {mes.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}

export { MESES_NOMES, MESES_KEYS };
