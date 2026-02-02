import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Sheet3Record } from '@/hooks/useSheet3Data';

interface BuyerAnalysisChartsProps {
  data: Sheet3Record[];
}

export default function BuyerAnalysisCharts({ data }: BuyerAnalysisChartsProps) {
  const chartData = useMemo(() => {
    // Filtrar apenas compradores reais (excluir TOTAL e DESCONTINUADO)
    const activeData = data.filter(row => {
      const comprador = String(row.COMPRADOR || '').toUpperCase();
      return comprador !== 'TOTAL' && comprador !== 'DESCONTINUADO';
    });

    // Dados por comprador
    const buyerMetrics = activeData
      .map(row => {
        // Usar nomes corretos dos campos do sheet3_data_complete.json
        const serviceLevel = Number((Number(row['NIVEL_SERVICO_S_PENDENCIA'] || row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0) * 100);
        const rupture = Number(row['RUPTURA_TOTAL'] || row['% RUPTURA TOTAL']) || 0;
        const excess = Number(row['EXCESSO_TOTAL'] || row['% EXCESSO TOTAL']) || 0;
        const inventory = Number(row['VALOR_ESTOQUE_VENDA'] || row['VALOR ESTOQUE PREÇO VENDA']) || 0;
        return {
          name: String(row.COMPRADOR || '').substring(0, 12),
          serviceLevel: Number(serviceLevel.toFixed(1)),
          rupture: Number((rupture * 100).toFixed(2)),
          excess: Number((excess * 100).toFixed(2)),
          inventory: Math.round(inventory / 1000000),
          skuAtivos: Number(row['SKU_ATIVOS'] || row['SKU INDUSTRIA ATIVOS']) || 0
        };
      })
      .sort((a, b) => Number(b.serviceLevel) - Number(a.serviceLevel));

    // Radar chart data
    const radarData = activeData
      .map(row => {
        const serviceLevel = Number((Number(row['NIVEL_SERVICO_S_PENDENCIA'] || row['NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA']) || 0) * 100);
        const rupture = 100 - Number((Number(row['RUPTURA_TOTAL'] || row['% RUPTURA TOTAL']) || 0) * 100);
        const excess = 100 - Number((Number(row['EXCESSO_TOTAL'] || row['% EXCESSO TOTAL']) || 0) * 100);
        return {
          name: String(row.COMPRADOR || '').substring(0, 8),
          'Nível Serviço': Number(serviceLevel.toFixed(1)),
          'Ruptura': Number(rupture.toFixed(1)),
          'Excesso': Number(excess.toFixed(1)),
          'SKU Ativos': Math.min(100, (Number(row['SKU_ATIVOS'] || row['SKU INDUSTRIA ATIVOS']) || 0) / 10)
        };
      });

    // Comparação de valores
    const valueComparison = activeData
      .map(row => {
        const custoValue = Number(row['VALOR_ESTOQUE_CUSTO'] || row['VALOR ESTOQUE PREÇO CUSTO']) || 0;
        const vendaValue = Number(row['VALOR_ESTOQUE_VENDA'] || row['VALOR ESTOQUE PREÇO VENDA']) || 0;
        return {
          name: String(row.COMPRADOR || '').substring(0, 12),
          custo: Math.round(custoValue / 1000000),
          venda: Math.round(vendaValue / 1000000)
        };
      });

    return {
      buyerMetrics,
      radarData,
      valueComparison
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Métricas por Comprador */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Nível de Serviço por Comprador
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData.buyerMetrics}>
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
            <Bar dataKey="serviceLevel" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart - Análise Multidimensional */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Análise Multidimensional por Comprador
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={chartData.radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" stroke="#6b7280" />
            <PolarRadiusAxis stroke="#6b7280" />
            <Radar name="Nível Serviço" dataKey="Nível Serviço" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
            <Radar name="Ruptura" dataKey="Ruptura" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparação de Valores */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Valor de Estoque: Custo vs Venda
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData.valueComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" label={{ value: 'Valor (Milhões R$)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `R$ ${value}M`}
            />
            <Legend />
            <Bar dataKey="custo" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Preço Custo" />
            <Bar dataKey="venda" fill="#0891b2" radius={[8, 8, 0, 0]} name="Preço Venda" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
