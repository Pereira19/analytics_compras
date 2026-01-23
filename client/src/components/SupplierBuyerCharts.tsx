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
  ResponsiveContainer
} from 'recharts';
import { Sheet4Record } from '@/hooks/useSheet4Data';

interface SupplierBuyerChartsProps {
  data: Sheet4Record[];
}

const COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#164e63', '#0c4a6e'];

export default function SupplierBuyerCharts({ data }: SupplierBuyerChartsProps) {
  const chartData = useMemo(() => {
    // Dados por comprador
    const buyerData: Record<string, number> = {};
    const supplierData: Record<string, number> = {};

    data.forEach((row: Sheet4Record) => {
      const supplier = String(row['FORNECEDOR RESUMIDO'] || '').trim();
      const buyer = String(row['COMPRADOR RESUMIDO'] || '').trim();
      const value = Number(row['PROJETO VALOR']) || 0;

      if (supplier && buyer) {
        buyerData[buyer] = (buyerData[buyer] || 0) + value;
        supplierData[supplier] = (supplierData[supplier] || 0) + value;
      }
    });

    // Top 10 fornecedores
    const topSuppliers = Object.entries(supplierData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.substring(0, 15) + (name.length > 15 ? '...' : ''),
        value: Math.round(value / 1000000) // Converter para milhões
      }));

    // Distribuição por comprador
    const buyerDistribution = Object.entries(buyerData)
      .map(([name, value]) => ({
        name,
        value: Math.round(value / 1000000)
      }))
      .sort((a, b) => b.value - a.value);

    return {
      topSuppliers,
      buyerDistribution
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top 10 Fornecedores */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Top 10 Fornecedores por Valor
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.topSuppliers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#6b7280" label={{ value: 'Valor (Milhões R$)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `R$ ${value}M`}
            />
            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
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
              data={chartData.buyerDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: R$ ${value}M`}
              outerRadius={100}
              dataKey="value"
            >
              {chartData.buyerDistribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `R$ ${value}M`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
