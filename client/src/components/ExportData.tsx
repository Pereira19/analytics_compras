import { Download, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParsedData } from '@/hooks/useExcelParser';

interface ExportDataProps {
  data: ParsedData;
}

export default function ExportData({ data }: ExportDataProps) {
  const exportToJSON = () => {
    const jsonString = JSON.stringify(data.rows, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    // Headers
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row =>
        data.headers
          .map(header => {
            const value = row[header];
            // Escapar valores com vírgula ou aspas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-metric">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Exportar Dados
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={exportToJSON}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FileJson className="w-4 h-4" />
          Exportar JSON
        </Button>

        <Button
          onClick={exportToCSV}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <FileText className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="mt-4 p-3 bg-secondary/50 rounded text-sm text-muted-foreground">
        <Download className="w-4 h-4 inline mr-2" />
        Total de {data.rows.length} linhas para exportar
      </div>
    </div>
  );
}
