import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParsedData } from '@/hooks/useExcelParser';

interface DataTableProps {
  data: ParsedData;
}

const ROWS_PER_PAGE = 10;

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.rows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = data.rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="card-metric">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Dados da Planilha
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {data.headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left font-semibold text-foreground bg-secondary/30 text-xs uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border hover:bg-secondary/20 transition-colors"
              >
                {data.headers.map((header) => (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="px-4 py-3 text-foreground"
                  >
                    {String(row[header] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Página {currentPage} de {totalPages} ({data.rows.length} linhas)
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            size="sm"
            variant="outline"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
