import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet1Record } from '@/hooks/useSheet1Data';

interface ProductFiltersProps {
  data: Sheet1Record[];
  selectedFornecedor: string | null;
  selectedComprador: string | null;
  selectedCurva: string | null;
  onFornecedorChange: (value: string | null) => void;
  onCompradorChange: (value: string | null) => void;
  onCurvaChange: (value: string | null) => void;
}

export default function ProductFilters({
  data,
  selectedFornecedor,
  selectedComprador,
  selectedCurva,
  onFornecedorChange,
  onCompradorChange,
  onCurvaChange
}: ProductFiltersProps) {
  const { fornecedores, compradores, curvas } = useMemo(() => {
    const fornecedoresSet = new Set<string>();
    const compradoresSet = new Set<string>();
    const curvasSet = new Set<string>();

    data.forEach(row => {
      if (row.FORNECEDOR) fornecedoresSet.add(String(row.FORNECEDOR));
      if (row.COMPRADOR) compradoresSet.add(String(row.COMPRADOR));
      if (row['CURVA ABC']) curvasSet.add(String(row['CURVA ABC']));
    });

    return {
      fornecedores: Array.from(fornecedoresSet).sort(),
      compradores: Array.from(compradoresSet).sort(),
      curvas: Array.from(curvasSet).sort()
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 card-metric">
      {/* Filtro Fornecedor */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Fornecedor
        </label>
        <Select value={selectedFornecedor || 'all'} onValueChange={(val) => onFornecedorChange(val === 'all' ? null : val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os fornecedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os fornecedores</SelectItem>
            {fornecedores.map((fornecedor) => (
              <SelectItem key={fornecedor} value={fornecedor}>
                {fornecedor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Comprador */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Comprador
        </label>
        <Select value={selectedComprador || 'all'} onValueChange={(val) => onCompradorChange(val === 'all' ? null : val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os compradores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os compradores</SelectItem>
            {compradores.map((comprador) => (
              <SelectItem key={comprador} value={comprador}>
                {comprador}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Curva ABC */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Curva ABC
        </label>
        <Select value={selectedCurva || 'all'} onValueChange={(val) => onCurvaChange(val === 'all' ? null : val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as curvas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as curvas</SelectItem>
            {curvas.map((curva) => (
              <SelectItem key={curva} value={curva}>
                {curva}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
