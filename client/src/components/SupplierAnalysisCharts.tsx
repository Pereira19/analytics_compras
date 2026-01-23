import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { Sheet2Record } from '@/hooks/useSheet2Data';

interface SupplierAnalysisChartsProps {
  data: Sheet2Record[];
}

export default function SupplierAnalysisCharts({ data }: SupplierAnalysisChartsProps) {
  const chartData = useMemo(() => {
    // Top 10 fornecedores por Nível de Serviço
    const topSuppliers = data
      .map(row => ({
        name: String(row.Fornecedor || '').substring(0, 12),
        serviceLevel: Number(row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0,
        rupture: Number(row['% RUPTURA TOTAL']) || 0,
        excess: Number(row['% EXCESSO TOTAL']) || 0,
        inventory: Number(row['VALOR ESTOQUE PREÇO VENDA']) || 0
      }))
      .sort((a, b) => b.serviceLevel - a.serviceLevel)
      .slice(0, 10)
      .map(item => ({
        ...item,
        serviceLevel: Number((item.serviceLevel * 100).toFixed(1)),
        rupture: Number((item.rupture * 100).toFixed(2)),
        excess: Number((item.excess * 100).toFixed(2)),
        inventory: Math.round(item.inventory / 1000000)
      }));

    // Top 10 fornecedores por Ruptura
    const topRuptureSuppliers = data
      .map(row => ({
        name: String(row.Fornecedor || '').substring(0, 12),
        rupture: Number(row['% RUPTURA TOTAL']) || 0,
      }))
      .sort((a, b) => b.rupture - a.rupture)
      .slice(0, 10)
      .map(item => ({
        ...item,
        rupture: Number((item.rupture * 100).toFixed(2))
      }));

    // Scatter plot: Ruptura vs Excesso
    const scatterData = data
      .filter(row => {
        const rupture = Number(row['% RUPTURA TOTAL']) || 0;
        const excess = Number(row['% EXCESSO TOTAL']) || 0;
        return rupture >= 0 && excess >= 0;
      })
      .map(row => ({
        rupture: Number(((Number(row['% RUPTURA TOTAL']) || 0) * 100).toFixed(2)),
        excess: Number(((Number(row['% EXCESSO TOTAL']) || 0) * 100).toFixed(2)),
        name: String(row.Fornecedor || ''),
        fill: (Number(row['% RUPTURA TOTAL']) || 0) > 0.1 ? '#ef4444' : '#f97316'
      }));

    // Distribuição por comprador
    const buyerDistribution: Record<string, any> = {};
    data.forEach(row => {
      const buyer = String(row.COMPRADOR || '').trim();
      const serviceLevel = Number(row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0;
      
      if (!buyerDistribution[buyer]) {
        buyerDistribution[buyer] = { name: buyer, count: 0, avgServiceLevel: 0 };
      }
      buyerDistribution[buyer].count += 1;
      buyerDistribution[buyer].avgServiceLevel += serviceLevel;
    });

    const buyerChartData = Object.values(buyerDistribution)
      .map((item: any) => ({
        name: item.name,
        count: item.count,
        avgServiceLevel: Number(((item.avgServiceLevel / item.count) * 100).toFixed(1)),
        fill: ((item.avgServiceLevel / item.count) * 100) > 90 ? '#10b981' : ((item.avgServiceLevel / item.count) * 100) > 80 ? '#3b82f6' : '#f59e0b'
      }))
      .sort((a: any, b: any) => b.avgServiceLevel - a.avgServiceLevel);

    return {
      topSuppliers,
      topRuptureSuppliers,
      scatterData,
      buyerChartData
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top 10 Fornecedores - Nível de Serviço (Linha de Tendência) */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Top 10 Fornecedores por Nível de Serviço
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.topSuppliers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#6b7280" label={{ value: 'Nível de Serviço (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Line type="monotone" dataKey="serviceLevel" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Fornecedores - Ruptura (Barras Vermelhas) */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Top 10 Fornecedores por Ruptura (%)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.topRuptureSuppliers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#6b7280" label={{ value: 'Ruptura (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Bar dataKey="rupture" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ruptura vs Excesso */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Análise: Ruptura vs Excesso
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="rupture" name="Ruptura (%)" stroke="#6b7280" />
            <YAxis dataKey="excess" name="Excesso (%)" stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any) => `${value}%`}
            />
            {chartData.scatterData.map((entry, index) => (
              <Scatter key={`scatter-${index}`} name={entry.name} data={[entry]} fill={entry.fill} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Nível de Serviço por Comprador */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Nível de Serviço Médio por Comprador
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.buyerChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" label={{ value: 'Nível de Serviço (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Legend />
            <Bar dataKey="avgServiceLevel" radius={[8, 8, 0, 0]} name="Nível Médio">
              {chartData.buyerChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
