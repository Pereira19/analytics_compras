import { usePeriodFilter, getPeriodLabel, type PeriodType, type PeriodFilter } from '@/contexts/PeriodFilterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function GlobalPeriodFilter() {
  const { periodFilter, setPeriodFilter, availableYears } = usePeriodFilter();

  const handleTypeChange = (type: PeriodType) => {
    const newFilter: PeriodFilter = { type, year: periodFilter.year };
    
    if (type === 'month') {
      newFilter.month = periodFilter.month || 1;
    } else if (type === 'quarter') {
      newFilter.quarter = periodFilter.quarter || 1;
    } else if (type === 'semester') {
      newFilter.semester = periodFilter.semester || 1;
    }
    
    setPeriodFilter(newFilter);
  };

  const handleYearChange = (year: string) => {
    setPeriodFilter({ ...periodFilter, year: parseInt(year) });
  };

  const handleMonthChange = (month: string) => {
    if (periodFilter.type === 'month') {
      setPeriodFilter({ ...periodFilter, month: parseInt(month) });
    }
  };

  const handleQuarterChange = (quarter: string) => {
    if (periodFilter.type === 'quarter') {
      setPeriodFilter({ ...periodFilter, quarter: parseInt(quarter) });
    }
  };

  const handleSemesterChange = (semester: string) => {
    if (periodFilter.type === 'semester') {
      setPeriodFilter({ ...periodFilter, semester: parseInt(semester) });
    }
  };

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const quarters = ['Q1 (Jan-Mar)', 'Q2 (Abr-Jun)', 'Q3 (Jul-Set)', 'Q4 (Out-Dez)'];
  const semesters = ['S1 (Jan-Jun)', 'S2 (Jul-Dez)'];

  return (
    <div className="card-metric bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Ícone */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-semibold text-foreground">Período:</span>
        </div>

        {/* Tipo de Período */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleTypeChange('month')}
            variant={periodFilter.type === 'month' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            Mês
          </Button>
          <Button
            onClick={() => handleTypeChange('quarter')}
            variant={periodFilter.type === 'quarter' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            Trimestre
          </Button>
          <Button
            onClick={() => handleTypeChange('semester')}
            variant={periodFilter.type === 'semester' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            Semestre
          </Button>
        </div>

        {/* Ano */}
        <Select value={String(periodFilter.year)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mês */}
        {periodFilter.type === 'month' && (
          <Select value={String(periodFilter.month || 1)} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, idx) => (
                <SelectItem key={idx} value={String(idx + 1)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Trimestre */}
        {periodFilter.type === 'quarter' && (
          <Select value={String(periodFilter.quarter || 1)} onValueChange={handleQuarterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((quarter, idx) => (
                <SelectItem key={idx} value={String(idx + 1)}>
                  {quarter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Semestre */}
        {periodFilter.type === 'semester' && (
          <Select value={String(periodFilter.semester || 1)} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester, idx) => (
                <SelectItem key={idx} value={String(idx + 1)}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Label do período selecionado */}
        <div className="ml-auto text-sm font-semibold text-cyan-700 bg-white px-3 py-1 rounded-lg border border-cyan-200">
          {getPeriodLabel(periodFilter)}
        </div>
      </div>
    </div>
  );
}
