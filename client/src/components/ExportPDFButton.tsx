import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportPDFButtonProps {
  title: string;
  fileName: string;
  content: string;
}

export default function ExportPDFButton({ title, fileName, content }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar HTML para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #0891b2;
              border-bottom: 2px solid #0891b2;
              padding-bottom: 10px;
            }
            .metadata {
              background-color: #f0f9ff;
              padding: 10px;
              border-left: 4px solid #0891b2;
              margin-bottom: 20px;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #0891b2;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="metadata">
            <p><strong>Data de Exportação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Formato:</strong> PDF</p>
          </div>
          ${content}
          <div class="footer">
            <p>Relatório gerado automaticamente pela Analytics Dashboard</p>
          </div>
        </body>
        </html>
      `;

      // Usar a biblioteca html2pdf se disponível, caso contrário usar print
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        (window as any).html2pdf().set({
          margin: 10,
          filename: `${fileName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        }).save();
      } else {
        // Fallback: abrir em nova janela para impressão
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          newWindow.print();
        }
      }

      toast.success(`Relatório "${fileName}" exportado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isExporting}
      className="gap-2"
      variant="default"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
