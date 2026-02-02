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

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
const CURVA_COLORS: Record<string, string> = {
  'A': '#10b981',    // Verde
  'B': '#f59e0b',    // Laranja
  'C': '#ef4444',    // Vermelho
  'AA': '#3b82f6',   // Azul
  'AAA': '#8b5cf6'   // Roxo
};

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

    // Bubble Chart: Estoque vs Giro agregado por Curva ABC
    const curvaAggregation = new Map<string, {
      count: number;
      totalEstoque: number;
      totalGiro: number;
      avgEstoque: number;
      avgGiro: number;
    }>();

    data.forEach(row => {
      const curva = String(row['CURVA ABC'] || 'N/A');
      const estoque = Number(row['ESTOQUE DISPONÍVEL']) || 0;
      const giro = Number(row['GIRO MÉDIO MENSAL']) || 0;

      if (!curvaAggregation.has(curva)) {
        curvaAggregation.set(curva, {
          count: 0,
          totalEstoque: 0,
          totalGiro: 0,
          avgEstoque: 0,
          avgGiro: 0
        });
      }

      const current = curvaAggregation.get(curva)!;
      current.count += 1;
      current.totalEstoque += estoque;
      current.totalGiro += giro;
    });

    const bubbleData = Array.from(curvaAggregation.entries())
      .map(([curva, stats]) => ({
        curva,
        count: stats.count,
        avgEstoque: Math.round(stats.totalEstoque / stats.count),
        avgGiro: Math.round(stats.totalGiro / stats.count),
        fill: CURVA_COLORS[curva] || '#6b7280'
      }))
      .sort((a, b) => b.count - a.count);

    // Scatter: Estoque vs Giro (limitado para performance, com cores por curva)
    const scatterData = data
      .filter(row => Number(row['ESTOQUE DISPONÍVEL']) > 0 || Number(row['GIRO MÉDIO MENSAL']) > 0)
      .slice(0, 300) // Reduzido para melhor performance
      .map(row => ({
        estoque: Number(row['ESTOQUE DISPONÍVEL']) || 0,
        giro: Number(row['GIRO MÉDIO MENSAL']) || 0,
        curva: String(row['CURVA ABC'] || 'N/A'),
        fill: CURVA_COLORS[String(row['CURVA ABC'] || 'N/A')] || '#6b7280'
      }));

    return {
      curvaData,
      topFornecedores,
      topCompradores,
      bubbleData,
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
        <ResponsiveContainer width="100%" height={220}>
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
        <ResponsiveContainer width="100%" height={220}>
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
        <ResponsiveContainer width="100%" height={220}>
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

      {/* Bubble Chart: Estoque vs Giro agregado por Curva ABC */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Análise Estoque vs Giro Médio Mensal (Agregado por Curva ABC)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tamanho das bolhas = quantidade de produtos | Posição = estoque médio vs giro médio
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              dataKey="avgEstoque" 
              name="Estoque Médio" 
              stroke="#6b7280"
              label={{ value: 'Estoque Médio', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              type="number" 
              dataKey="avgGiro" 
              name="Giro Médio" 
              stroke="#6b7280"
              label={{ value: 'Giro Médio', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toLocaleString('pt-BR');
                }
                return value;
              }}
              labelFormatter={(label: any) => {
                if (typeof label === 'object' && label !== null) {
                  return `Curva: ${label.curva || 'N/A'}`;
                }
                return label;
              }}
            />
            <Legend />
            {chartData.bubbleData.map((entry, index) => (
              <Scatter
                key={`bubble-${index}`}
                name={`Curva ${entry.curva} (${entry.count} produtos)`}
                data={[entry]}
                fill={entry.fill}
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter: Estoque vs Giro (todos os produtos com cores por curva) */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Detalhamento: Estoque vs Giro Médio Mensal (Primeiros 300 Produtos)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cores indicam a Curva ABC de cada produto
        </p>
        <ResponsiveContainer width="100%" height={280}>
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
            <Legend />
            {/* Agrupar por curva para legend */}
            {['A', 'B', 'C', 'AA', 'AAA'].map((curva) => (
              <Scatter
                key={`scatter-${curva}`}
                name={`Curva ${curva}`}
                data={chartData.scatterData.filter(d => d.curva === curva)}
                fill={CURVA_COLORS[curva] || '#6b7280'}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
