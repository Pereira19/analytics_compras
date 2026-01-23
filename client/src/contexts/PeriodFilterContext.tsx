import React, { createContext, useContext, useState } from 'react';

export type PeriodType = 'month' | 'quarter' | 'semester';

export interface PeriodFilter {
  type: PeriodType;
  year: number;
  month?: number; // 1-12 para month
  quarter?: number; // 1-4 para quarter
  semester?: number; // 1-2 para semester
}

interface PeriodFilterContextType {
  periodFilter: PeriodFilter;
  setPeriodFilter: (filter: PeriodFilter) => void;
  availableYears: number[];
  setAvailableYears: (years: number[]) => void;
}

const PeriodFilterContext = createContext<PeriodFilterContextType | undefined>(undefined);

export function PeriodFilterProvider({ children }: { children: React.ReactNode }) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    type: 'month',
    year: 2026,
    month: 1
  });

  const [availableYears, setAvailableYears] = useState<number[]>([2023, 2024, 2025, 2026]);

  return (
    <PeriodFilterContext.Provider value={{ periodFilter, setPeriodFilter, availableYears, setAvailableYears }}>
      {children}
    </PeriodFilterContext.Provider>
  );
}

export function usePeriodFilter() {
  const context = useContext(PeriodFilterContext);
  if (!context) {
    throw new Error('usePeriodFilter must be used within PeriodFilterProvider');
  }
  return context;
}

// Funções utilitárias
export function getPeriodLabel(filter: PeriodFilter): string {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  if (filter.type === 'month' && filter.month) {
    return `${months[filter.month - 1]}/${filter.year}`;
  } else if (filter.type === 'quarter' && filter.quarter) {
    return `Q${filter.quarter}/${filter.year}`;
  } else if (filter.type === 'semester' && filter.semester) {
    return `S${filter.semester}/${filter.year}`;
  }
  return 'Período não definido';
}

export function getMonthsInPeriod(filter: PeriodFilter): { month: number; year: number }[] {
  const months: { month: number; year: number }[] = [];

  if (filter.type === 'month' && filter.month) {
    months.push({ month: filter.month, year: filter.year });
  } else if (filter.type === 'quarter' && filter.quarter) {
    const startMonth = (filter.quarter - 1) * 3 + 1;
    for (let i = 0; i < 3; i++) {
      months.push({ month: startMonth + i, year: filter.year });
    }
  } else if (filter.type === 'semester' && filter.semester) {
    const startMonth = (filter.semester - 1) * 6 + 1;
    for (let i = 0; i < 6; i++) {
      months.push({ month: startMonth + i, year: filter.year });
    }
  }

  return months;
}

export function getMonthKey(month: number, year: number): string {
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${monthNames[month - 1]}/${String(year).slice(-2)}`;
}
