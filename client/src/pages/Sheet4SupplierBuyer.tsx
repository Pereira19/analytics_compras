import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, Users, BarChart3, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UpdateDataButton from '@/components/UpdateDataButton';
import MonthFilterContainer from '@/components/MonthFilterContainer';
import { useSheet4CompleteData, Sheet4CompleteRecord } from '@/hooks/useSheet4CompleteData';
import { usePeriodFilter, getMonthsInPeriod } from '@/contexts/PeriodFilterContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const ROWS_PER_PAGE = 15;
const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899'];

type AggregationType = 'detalhado' | 'fornecedor' | 'comprador';

interface Sheet4SupplierBuyerProps {
  selectedMonth?: string | null;
}

export default function Sheet4SupplierBuyer({ selectedMonth: propSelectedMonth }: Sheet4SupplierBuyerProps) {
  const { data, isLoading, error, refreshData } = useSheet4CompleteData();
  const { periodFilter } = usePeriodFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(propSelectedMonth || null);
  const [aggregationType, setAggregationType] = useState<AggregationType>('detalhado');

  // Agregar dados conforme tipo selecionado
  const aggregatedData = useMemo(() => {
    if (aggregationType === 'detalhado') {
      return data;
    }

    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const aggregated = new Map<string, any>();

    data.forEach(row => {
      let key: string;
      if (aggregationType === 'fornecedor') {
        key = row['FORNECEDOR RESUMIDO'] || row.FORNECEDOR;
      } else {
        key = row['COMPRADOR RESUMIDO'] || row['COMPRADOR 01/26'];
      }

      if (!aggregated.has(key)) {
        aggregated.set(key, {
          COD: row.COD,
          FORNECEDOR: aggregationType === 'fornecedor' ? key : 'Agregado',
          'FORNECEDOR RESUMIDO': aggregationType === 'fornecedor' ? key : 'Agregado',
          COMPRADOR: aggregationType === 'comprador' ? key : 'Agregado',
          'COMPRADOR RESUMIDO': aggregationType === 'comprador' ? key : 'Agregado',
          'COMPRADOR 01/26': aggregationType === 'comprador' ? key : 'Agregado',
          'STATUS DA MARCA': row['STATUS DA MARCA'],
          'PROJETO MARGEM': 0,
          'PROJETO VALOR': 0,
          count: 0,
          ...Object.fromEntries(months.map(m => [m, 0]))
        });
      }

      const agg = aggregated.get(key)!;
      months.forEach(month => {
        agg[month] = (agg[month] || 0) + (row[month as keyof Sheet4CompleteRecord] as number || 0);
      });
      agg['PROJETO MARGEM'] = (agg['PROJETO MARGEM'] || 0) + (row['PROJETO MARGEM'] || 0);
      agg['PROJETO VALOR'] = (agg['PROJETO VALOR'] || 0) + (row['PROJETO VALOR'] || 0);
      agg.count = (agg.count || 0) + 1;
    });

    // Calcular margem média
    aggregated.forEach(agg => {
      if (agg.count > 0) {
        agg['PROJETO MARGEM'] = agg['PROJETO MARGEM'] / agg.count;
      }
    });

    return Array.from(aggregated.values());
  }, [data, aggregationType]);

  // Filtrar dados
  const filteredRows = useMemo(() => {
    let filtered = aggregatedData;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [aggregatedData, searchTerm]);

  // Dados com filtro de período aplicado (do contexto global)
  const dataWithPeriodFilter = useMemo(() => {
    const monthsInPeriod = getMonthsInPeriod(periodFilter);
    
    return filteredRows.map(row => {
      let totalValue = 0;
      monthsInPeriod.forEach(({ month }) => {
        const monthKey = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][month - 1];
        totalValue += (row[monthKey as keyof Sheet4CompleteRecord] as number) || 0;
      });
      
      return {
        ...row,
        periodValue: totalValue
      };
    });
  }, [filteredRows, periodFilter]);

  // Dados com filtro de mês aplicado (local)
  const dataWithMonthFilter = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'Todos') return dataWithPeriodFilter;

    return dataWithPeriodFilter.map(row => ({
      ...row,
      monthValue: row[selectedMonth as keyof Sheet4CompleteRecord] as number || 0
    }));
  }, [dataWithPeriodFilter, selectedMonth]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    const dataForKPI = selectedMonth && selectedMonth !== 'Todos' ? dataWithMonthFilter : dataWithPeriodFilter;
    const totalFornecedores = new Set(dataForKPI.map(r => r['FORNECEDOR RESUMIDO'] || r.FORNECEDOR)).size;
    const totalCompradores = new Set(dataForKPI.map(r => r['COMPRADOR RESUMIDO'] || r['COMPRADOR 01/26'])).size;
    
    let totalValor = 0;
    let totalMargem = 0;
    
    if (selectedMonth && selectedMonth !== 'Todos') {
      totalValor = dataForKPI.reduce((sum, r) => sum + (r.monthValue || 0), 0);
      totalMargem = dataForKPI.reduce((sum, r) => sum + (r['PROJETO MARGEM'] || 0), 0);
    } else {
      totalValor = dataForKPI.reduce((sum, r) => sum + (r.periodValue || 0), 0);
      totalMargem = dataForKPI.reduce((sum, r) => sum + (r['PROJETO MARGEM'] || 0), 0);
    }

    const label = selectedMonth && selectedMonth !== 'Todos' ? `${selectedMonth}/2026` : `Período`;
    const avgMargem = dataForKPI.length > 0 ? (totalMargem / dataForKPI.length) * 100 : 0;
    
    return [
      {
        label: 'Total de Fornecedores',
        value: totalFornecedores.toLocaleString('pt-BR'),
        icon: Users,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        label: 'Total de Compradores',
        value: totalCompradores.toLocaleString('pt-BR'),
        icon: BarChart3,
        color: 'from-green-500 to-emerald-500'
      },
      {
        label: `Valor ${label}`,
        value: `R$ ${(totalValor / 1000000).toFixed(2)}M`,
        icon: DollarSign,
        color: 'from-purple-500 to-pink-500'
      },
      {
        label: 'Margem Média',
        value: `${avgMargem.toFixed(2)}%`,
        icon: TrendingUp,
        color: 'from-orange-500 to-red-500'
      }
    ];
  }, [data, periodFilter, selectedMonth, dataWithMonthFilter, dataWithPeriodFilter]);

  // Gráficos
  const chartData = useMemo(() => {
    const dataForCharts = selectedMonth && selectedMonth !== 'Todos' ? dataWithMonthFilter : dataWithPeriodFilter;
    const valueKey = selectedMonth && selectedMonth !== 'Todos' ? 'monthValue' : 'periodValue';
    
    // Top 10 Fornecedores
    const fornecedorMap = new Map<string, number>();
    dataForCharts.forEach(row => {
      const key = row['FORNECEDOR RESUMIDO'] || row.FORNECEDOR;
      const value = selectedMonth ? (row.monthValue || 0) : (row.periodValue || 0);
      fornecedorMap.set(key, (fornecedorMap.get(key) || 0) + value);
    });

    const topFornecedores = Array.from(fornecedorMap.entries())
      .map(([name, value]) => ({ 
        name: name.substring(0, 20), 
        value,
        fill: value > 50000000 ? '#06b6d4' : value > 30000000 ? '#0ea5e9' : '#3b82f6'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Distribuição por Comprador
    const compradorMap = new Map<string, number>();
    dataForCharts.forEach(row => {
      const key = row['COMPRADOR RESUMIDO'] || row['COMPRADOR 01/26'];
      const value = selectedMonth ? (row.monthValue || 0) : (row.periodValue || 0);
      compradorMap.set(key, (compradorMap.get(key) || 0) + value);
    });

    const compradores = Array.from(compradorMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Evolução mensal
    const monthlyData = [
      { month: 'JAN', value: 0 },
      { month: 'FEV', value: 0 },
      { month: 'MAR', value: 0 },
      { month: 'ABR', value: 0 },
      { month: 'MAI', value: 0 },
      { month: 'JUN', value: 0 },
      { month: 'JUL', value: 0 },
      { month: 'AGO', value: 0 },
      { month: 'SET', value: 0 },
      { month: 'OUT', value: 0 },
      { month: 'NOV', value: 0 },
      { month: 'DEZ', value: 0 }
    ];

    dataForCharts.forEach(row => {
      monthlyData.forEach(m => {
        m.value += (row[m.month as keyof Sheet4CompleteRecord] as number) || 0;
      });
    });

    return { topFornecedores, compradores, monthlyData };
  }, [data, periodFilter, selectedMonth, dataWithMonthFilter, dataWithPeriodFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = filteredRows.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="ml-3 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-metric bg-red-50 border border-red-200">
        <p className="text-red-600 font-semibold">Erro ao carregar dados</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  const headers = ['COD', 'Fornecedor', 'Comprador', 'Status', 'Margem', 'Valor Projeto', 'JAN', 'DEZ'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Matriz Fornecedor × Comprador
          </h2>
          <p className="text-muted-foreground">
            Análise de {data.length} combinações de fornecedor e comprador com dados mensais
          </p>
        </div>
        <UpdateDataButton onDataUpdate={refreshData} />
      </div>

      {/* Botões de Agrupamento */}
      <div className="flex gap-3 bg-white rounded-lg p-4 border border-border shadow-sm">
        <Button
          onClick={() => {
            setAggregationType('detalhado');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            aggregationType === 'detalhado'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          📊 Detalhado
        </Button>
        <Button
          onClick={() => {
            setAggregationType('fornecedor');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            aggregationType === 'fornecedor'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          🏭 Por Fornecedor
        </Button>
        <Button
          onClick={() => {
            setAggregationType('comprador');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            aggregationType === 'comprador'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          👥 Por Comprador
        </Button>
      </div>

      {/* KPIs */}
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

      {/* Filtro de Mês */}
      <MonthFilterContainer selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Fornecedores */}
        <div className="card-metric">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Top 10 Fornecedores por Valor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topFornecedores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.topFornecedores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Comprador */}
        <div className="card-metric">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Distribuição por Comprador
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.compradores}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${(value / 1000000).toFixed(1)}M`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.compradores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolução Mensal */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Evolução de Vendas Mensal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6 }}
              name="Faturamento"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela */}
      <div className="card-metric">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {aggregationType === 'detalhado' ? 'Dados Detalhados' : aggregationType === 'fornecedor' ? 'Agregado por Fornecedor' : 'Agregado por Comprador'}
          </h3>
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.COD}</td>
                  <td className="px-4 py-3 text-foreground">{String(row.FORNECEDOR || '-').substring(0, 20)}</td>
                  <td className="px-4 py-3 text-foreground">{String(row.COMPRADOR || row['COMPRADOR 01/26'] || '-').substring(0, 20)}</td>
                  <td className="px-4 py-3 text-foreground">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      row['STATUS DA MARCA'] === 'IMPORTANTE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {row['STATUS DA MARCA'] || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{((row['PROJETO MARGEM'] || 0) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-foreground">R$ {((row['PROJETO VALOR'] || 0) / 1000000).toFixed(2)}M</td>
                  <td className="px-4 py-3 text-foreground">R$ {((row.JAN || 0) / 1000000).toFixed(2)}M</td>
                  <td className="px-4 py-3 text-foreground">R$ {((row.DEZ || 0) / 1000000).toFixed(2)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} de {filteredRows.length}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-2 text-sm font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
