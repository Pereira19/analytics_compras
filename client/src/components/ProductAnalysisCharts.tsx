import { useMemo } from 'react';
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
  ScatterChart,
  Scatter
} from 'recharts';
import { Sheet1Record } from '@/hooks/useSheet1Data';

interface ProductAnalysisChartsProps {
  data: Sheet1Record[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function ProductAnalysisCharts({ data }: ProductAnalysisChartsProps) {
  const chartData = useMemo(() => {
    // Distribuição por Curva ABC
    const curvaDistribution = new Map<string, number>();
    data.forEach(row => {
      const curva = String(row['CURVA ABC'] || 'Não classificado');
      curvaDistribution.set(curva, (curvaDistribution.get(curva) || 0) + 1);
    });

    const curvaData = Array.from(curvaDistribution.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top 10 Fornecedores por quantidade de produtos
    const fornecedorCount = new Map<string, number>();
    data.forEach(row => {
      const fornecedor = String(row.FORNECEDOR || 'Desconhecido');
      fornecedorCount.set(fornecedor, (fornecedorCount.get(fornecedor) || 0) + 1);
    });

    const topFornecedores = Array.from(fornecedorCount.entries())
      .map(([name, value]) => ({ name: name.substring(0, 15), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Top 10 Compradores por quantidade de produtos
    const compradorCount = new Map<string, number>();
    data.forEach(row => {
      const comprador = String(row.COMPRADOR || 'Desconhecido');
      compradorCount.set(comprador, (compradorCount.get(comprador) || 0) + 1);
    });

    const topCompradores = Array.from(compradorCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Scatter: Estoque vs Giro
    const scatterData = data
      .filter(row => Number(row['ESTOQUE DISPONÍVEL']) > 0 || Number(row['GIRO MÉDIO MENSAL']) > 0)
      .slice(0, 500) // Limitar para performance
      .map(row => ({
        estoque: Number(row['ESTOQUE DISPONÍVEL']) || 0,
        giro: Number(row['GIRO MÉDIO MENSAL']) || 0,
        curva: String(row['CURVA ABC'] || 'N/A')
      }));

    return {
      curvaData,
      topFornecedores,
      topCompradores,
      scatterData
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Distribuição por Curva ABC */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Distribuição por Curva ABC
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData.curvaData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.curvaData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => value} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Fornecedores */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Top 10 Fornecedores por Quantidade de Produtos
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
            />
            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Compradores */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Top 10 Compradores por Quantidade de Produtos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.topCompradores}>
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
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter: Estoque vs Giro */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Análise Estoque vs Giro Médio Mensal
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="estoque" name="Estoque" stroke="#6b7280" />
            <YAxis dataKey="giro" name="Giro Mensal" stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Scatter name="Produtos" data={chartData.scatterData} fill="#f59e0b" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
