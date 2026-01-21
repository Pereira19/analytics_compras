import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ParsedData } from '@/hooks/useExcelParser';

interface AnalyticsChartsProps {
  data: ParsedData;
}

const COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#164e63', '#0c4a6e'];

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const chartData = useMemo(() => {
    const numericCols = data.stats.numericColumns.slice(0, 2);
    
    if (numericCols.length === 0) {
      return null;
    }

    // Preparar dados para gráficos
    const processedData = data.rows.slice(0, 20).map((row, idx) => ({
      name: `Item ${idx + 1}`,
      ...Object.fromEntries(
        numericCols.map(col => [col, Number(row[col]) || 0])
      )
    }));

    return {
      data: processedData,
      columns: numericCols
    };
  }, [data]);

  if (!chartData || chartData.columns.length === 0) {
    return (
      <div className="card-metric">
        <p className="text-center text-muted-foreground">
          Nenhuma coluna numérica encontrada para gráficos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Gráfico de Barras
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {chartData.columns.map((col, idx) => (
              <Bar
                key={col}
                dataKey={col}
                fill={COLORS[idx % COLORS.length]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Gráfico de Linhas
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {chartData.columns.map((col, idx) => (
              <Line
                key={col}
                type="monotone"
                dataKey={col}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[idx % COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - apenas primeira coluna numérica */}
      {chartData.columns.length > 0 && (
        <div className="card-metric">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Distribuição - {chartData.columns[0]}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                dataKey={chartData.columns[0]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
              >
                {chartData.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
