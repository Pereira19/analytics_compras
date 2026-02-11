import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { ChevronLeft, ChevronRight, Download, Filter, Loader2, TrendingUp, Users, DollarSign, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

interface ConsolidatedData {
  metadata: {
    lastUpdate: string;
    totalRecords: number;
    filiais: string[];
    periodo: string;
  };
  summary: {
    totalFiliais: number;
    totalFornecedores: number;
    totalCompradores: number;
    totalProdutos: number;
    estoqueTotal: number;
    faturamento2026: number;
    entrada2026: number;
  };
  aggregations: {
    byFilial: Record<string, any>;
    byFornecedor: Record<string, any>;
    byComprador: Record<string, any>;
  };
}

export default function ConsolidatedDashboard() {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilial, setSelectedFilial] = useState<string>('TODOS');
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>('TODOS');
  const [selectedComprador, setSelectedComprador] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar dados consolidados
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/consolidated_data.json');
        if (!response.ok) throw new Error('Erro ao carregar dados');
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    if (!data) return [];

    const summary = data.summary;
    return [
      {
        label: 'Total de Filiais',
        value: summary.totalFiliais.toString(),
        icon: Users,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        label: 'Total de Fornecedores',
        value: summary.totalFornecedores.toString(),
        icon: Package,
        color: 'from-green-500 to-emerald-500'
      },
      {
        label: 'Total de Compradores',
        value: summary.totalCompradores.toString(),
        icon: Users,
        color: 'from-purple-500 to-pink-500'
      },
      {
        label: 'Estoque Total',
        value: `R$ ${(summary.estoqueTotal / 1000000).toFixed(2)}M`,
        icon: DollarSign,
        color: 'from-orange-500 to-red-500'
      },
      {
        label: 'Faturamento 2026',
        value: `R$ ${(summary.faturamento2026 / 1000000).toFixed(2)}M`,
        icon: TrendingUp,
        color: 'from-indigo-500 to-blue-500'
      },
      {
        label: 'Entrada 2026',
        value: `R$ ${(summary.entrada2026 / 1000000).toFixed(2)}M`,
        icon: AlertCircle,
        color: 'from-rose-500 to-pink-500'
      }
    ];
  }, [data]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    if (!data) return { filiais: [], fornecedores: [], compradores: [] };

    // Top fornecedores
    const fornecedoresArray = Object.entries(data.aggregations.byFornecedor)
      .map(([nome, dados]: [string, any]) => ({
        name: nome.substring(0, 15),
        faturamento: dados.faturamento2026 || 0,
        estoque: dados.estoqueVenda || 0
      }))
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 10);

    // Filiais
    const filiaisArray = Object.entries(data.aggregations.byFilial)
      .map(([nome, dados]: [string, any]) => ({
        name: `Filial ${nome}`,
        faturamento: dados.faturamento2026 || 0,
        estoque: dados.estoqueVenda || 0,
        nivelServico: (dados.nivelServicoMedio * 100).toFixed(1),
        ruptura: (dados.rupturaPctMedio * 100).toFixed(1)
      }))
      .sort((a, b) => b.faturamento - a.faturamento);

    // Compradores
    const compradoresArray = Object.entries(data.aggregations.byComprador)
      .map(([nome, dados]: [string, any]) => ({
        name: nome,
        faturamento: dados.faturamento2026 || 0,
        estoque: dados.estoqueVenda || 0
      }))
      .sort((a, b) => b.faturamento - a.faturamento);

    return {
      filiais: filiaisArray,
      fornecedores: fornecedoresArray,
      compradores: compradoresArray
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="ml-3 text-muted-foreground">Carregando dados consolidados...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-metric bg-red-50 border border-red-200">
        <p className="text-red-600 font-semibold">Erro ao carregar dados</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Consolidado
          </h2>
          <p className="text-muted-foreground">
            Análise unificada de {data.summary.totalProdutos} produtos em {data.summary.totalFiliais} filiais
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card-metric group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {kpi.label}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="card-metric bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-cyan-600" />
          
          <Select value={selectedFilial} onValueChange={setSelectedFilial}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecionar Filial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todas as Filiais</SelectItem>
              {data.metadata.filiais.map(filial => (
                <SelectItem key={filial} value={filial}>
                  Filial {filial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFornecedor} onValueChange={setSelectedFornecedor}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecionar Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Fornecedores</SelectItem>
              {Object.keys(data.aggregations.byFornecedor).slice(0, 20).map(fornecedor => (
                <SelectItem key={fornecedor} value={fornecedor}>
                  {fornecedor.substring(0, 20)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedComprador} onValueChange={setSelectedComprador}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecionar Comprador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Compradores</SelectItem>
              {Object.keys(data.aggregations.byComprador).map(comprador => (
                <SelectItem key={comprador} value={comprador}>
                  {comprador}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento por Filial */}
        <div className="card-metric">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Faturamento 2026 por Filial
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.filiais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`}
              />
              <Bar dataKey="faturamento" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Fornecedores */}
        <div className="card-metric">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Top 10 Fornecedores
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.fornecedores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`}
              />
              <Bar dataKey="faturamento" fill="#0ea5e9" />
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
                label={({ name, faturamento }) => `${name}: R$ ${(faturamento / 1000000).toFixed(1)}M`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="faturamento"
              >
                {chartData.compradores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Comparativo Filial - Nível de Serviço */}
        <div className="card-metric">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Nível de Serviço por Filial
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.filiais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${value}%`}
              />
              <Legend />
              <Bar dataKey="nivelServico" fill="#10b981" name="Nível de Serviço (%)" />
              <Bar dataKey="ruptura" fill="#ef4444" name="Ruptura (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Comparativa */}
      <div className="card-metric">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Comparativo por Filial
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Filial</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Produtos</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Estoque</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Faturamento</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Nível Serviço</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide">Ruptura</th>
              </tr>
            </thead>
            <tbody>
              {chartData.filiais.map((filial, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{filial.name}</td>
                  <td className="px-4 py-3 text-foreground">{filial.name === 'Filial GERAL' ? '-' : '~110'}</td>
                  <td className="px-4 py-3 text-foreground">R$ {(filial.estoque / 1000000).toFixed(2)}M</td>
                  <td className="px-4 py-3 text-foreground font-semibold text-cyan-600">R$ {(filial.faturamento / 1000000).toFixed(2)}M</td>
                  <td className="px-4 py-3 text-foreground">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      parseFloat(filial.nivelServico) >= 80
                        ? 'bg-green-100 text-green-700'
                        : parseFloat(filial.nivelServico) >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {filial.nivelServico}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      parseFloat(filial.ruptura) <= 20
                        ? 'bg-green-100 text-green-700'
                        : parseFloat(filial.ruptura) <= 40
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {filial.ruptura}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
