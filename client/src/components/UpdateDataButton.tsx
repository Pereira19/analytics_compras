import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateDataButtonProps {
  onDataUpdate: () => Promise<void>;
}

export default function UpdateDataButton({ onDataUpdate }: UpdateDataButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Formato inválido. Use Excel (.xlsx, .xls) ou CSV (.csv)');
      return;
    }

    try {
      setIsLoading(true);
      
      // Simular upload e processamento
      // Em produção, isso seria enviado para um backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Chamar callback para atualizar dados
      await onDataUpdate();
      
      setLastUpdate(new Date());
      toast.success('✓ Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar arquivo');
      console.error(error);
    } finally {
      setIsLoading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className="gap-2"
        variant="default"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Atualizar Dados
          </>
        )}
      </Button>

      {lastUpdate && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <CheckCircle className="w-4 h-4" />
          <span>Atualizado em {lastUpdate.toLocaleTimeString('pt-BR')}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
        <AlertCircle className="w-4 h-4" />
        <span>Dados carregados automaticamente</span>
      </div>
    </div>
  );
}
