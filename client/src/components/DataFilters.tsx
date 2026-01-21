import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParsedData } from '@/hooks/useExcelParser';

interface DataFiltersProps {
  data: ParsedData;
  onFilterChange: (filteredData: ParsedData) => void;
}

export default function DataFilters({ data, onFilterChange }: DataFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchTerm && !activeColumn) {
      return data;
    }

    const filtered = data.rows.filter(row => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    return {
      ...data,
      rows: filtered,
      stats: {
        ...data.stats,
        totalRows: filtered.length
      }
    };
  }, [data, searchTerm, activeColumn]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onFilterChange(filteredData);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilterChange(data);
  };

  const uniqueValues = useMemo(() => {
    if (!activeColumn) return [];
    
    const values = new Set(
      data.rows
        .map(row => row[activeColumn])
        .filter(val => val !== null && val !== undefined)
    );
    
    return Array.from(values).slice(0, 10);
  }, [activeColumn, data]);

  return (
    <div className="card-metric">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Filtros e Busca
        </h3>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar em todos os dados..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <p className="text-sm text-muted-foreground">
            {filteredData.rows.length} de {data.rows.length} linhas encontradas
          </p>
        )}

        {/* Column Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              Colunas para Filtrar
            </p>
            <div className="grid grid-cols-2 gap-2">
              {data.headers.map(header => (
                <button
                  key={header}
                  onClick={() => setActiveColumn(activeColumn === header ? null : header)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    activeColumn === header
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {header}
                </button>
              ))}
            </div>

            {activeColumn && uniqueValues.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Valores únicos em {activeColumn}
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {uniqueValues.map((val, idx) => (
                    <div
                      key={idx}
                      className="text-xs px-2 py-1 bg-secondary rounded text-foreground"
                    >
                      {String(val)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
