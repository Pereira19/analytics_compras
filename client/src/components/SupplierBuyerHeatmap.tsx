import { useMemo, useState } from 'react';
import { Sheet4Record } from '@/hooks/useSheet4Data';

interface SupplierBuyerHeatmapProps {
  data: Sheet4Record[];
}

export default function SupplierBuyerHeatmap({ data }: SupplierBuyerHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const heatmapData = useMemo(() => {
    // Agrupar dados por Fornecedor e Comprador
    const matrix: Record<string, Record<string, number>> = {};
    const suppliers = new Set<string>();
    const buyers = new Set<string>();
    let maxValue = 0;

    data.forEach((row: Sheet4Record) => {
      const supplier = String(row['FORNECEDOR RESUMIDO'] || '').trim();
      const buyer = String(row['COMPRADOR RESUMIDO'] || '').trim();
      const value = Number(row['PROJETO VALOR']) || 0;

      if (supplier && buyer) {
        suppliers.add(supplier);
        buyers.add(buyer);

        if (!matrix[supplier]) {
          matrix[supplier] = {};
        }

        matrix[supplier][buyer] = (matrix[supplier][buyer] || 0) + value;
        maxValue = Math.max(maxValue, matrix[supplier][buyer]);
      }
    });

    return {
      matrix,
      suppliers: Array.from(suppliers).sort(),
      buyers: Array.from(buyers).sort(),
      maxValue
    };
  }, [data]);

  if (!heatmapData || heatmapData.suppliers.length === 0) {
    return (
      <div className="card-metric">
        <p className="text-center text-muted-foreground">
          Não foi possível processar os dados do heatmap
        </p>
      </div>
    );
  }

  const getColor = (value: number, maxValue: number) => {
    if (value === 0) return 'bg-gray-100';
    
    const intensity = value / maxValue;
    
    if (intensity < 0.25) return 'bg-blue-100';
    if (intensity < 0.5) return 'bg-blue-300';
    if (intensity < 0.75) return 'bg-blue-500';
    return 'bg-blue-700';
  };

  const getTextColor = (value: number, maxValue: number) => {
    const intensity = value / maxValue;
    return intensity > 0.5 ? 'text-white' : 'text-foreground';
  };

  return (
    <div className="card-metric">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Matriz Fornecedor × Comprador
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header com nomes dos compradores */}
          <div className="flex">
            <div className="w-48 flex-shrink-0"></div>
            <div className="flex">
              {heatmapData.buyers.map(buyer => (
                <div
                  key={buyer}
                  className="w-32 px-2 py-2 text-center text-xs font-semibold text-foreground border-b border-border"
                >
                  {buyer}
                </div>
              ))}
            </div>
          </div>

          {/* Linhas com fornecedores */}
          <div className="max-h-96 overflow-y-auto">
            {heatmapData.suppliers.map(supplier => (
              <div key={supplier} className="flex border-b border-border hover:bg-secondary/30">
                <div className="w-48 flex-shrink-0 px-3 py-2 text-xs font-medium text-foreground bg-secondary/20 border-r border-border truncate">
                  {supplier}
                </div>
                <div className="flex">
                  {heatmapData.buyers.map(buyer => {
                    const value = heatmapData.matrix[supplier]?.[buyer] || 0;
                    const cellKey = `${supplier}-${buyer}`;
                    const isHovered = hoveredCell === cellKey;

                    return (
                      <div
                        key={buyer}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-32 px-2 py-2 text-center text-xs font-semibold cursor-pointer transition-all ${getColor(
                          value,
                          heatmapData.maxValue
                        )} ${getTextColor(value, heatmapData.maxValue)} ${
                          isHovered ? 'ring-2 ring-accent' : ''
                        }`}
                        title={`${supplier} - ${buyer}: R$ ${value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}`}
                      >
                        {value > 0 ? (
                          <>
                            <div>
                              {(value / 1000000).toFixed(1)}M
                            </div>
                            {isHovered && (
                              <div className="text-xs opacity-80">
                                R$ {(value / 1000000).toFixed(2)}M
                              </div>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-foreground mb-2">Legenda de Intensidade:</p>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="w-6 h-6 bg-gray-100 border border-border rounded"></div>
          <span className="text-xs text-muted-foreground">Sem dados</span>
          
          <div className="w-6 h-6 bg-blue-100 border border-border rounded"></div>
          <span className="text-xs text-muted-foreground">Baixo</span>
          
          <div className="w-6 h-6 bg-blue-300 border border-border rounded"></div>
          <span className="text-xs text-muted-foreground">Médio</span>
          
          <div className="w-6 h-6 bg-blue-500 border border-border rounded"></div>
          <span className="text-xs text-muted-foreground">Alto</span>
          
          <div className="w-6 h-6 bg-blue-700 border border-border rounded"></div>
          <span className="text-xs text-muted-foreground">Muito Alto</span>
        </div>
      </div>
    </div>
  );
}
