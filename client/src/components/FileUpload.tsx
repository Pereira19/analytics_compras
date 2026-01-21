import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

export default function FileUpload({ onFileSelect, isLoading, error, success }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-lg border-2 border-dashed transition-all duration-300 p-8 text-center ${
        isDragActive
          ? 'border-accent bg-accent/5 scale-105'
          : 'border-border bg-gradient-to-br from-slate-50 to-cyan-50'
      } ${error ? 'border-destructive bg-destructive/5' : ''} ${
        success ? 'border-green-500 bg-green-50' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
        className="hidden"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center gap-4">
        {!isLoading && !error && !success && (
          <>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Arraste seu arquivo Excel aqui
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ou clique para selecionar (.xlsx, .xls, .csv)
              </p>
              <Button
                onClick={handleClick}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Selecionar Arquivo
              </Button>
            </div>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center animate-spin">
              <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent"></div>
            </div>
            <p className="text-sm font-medium text-foreground">
              Processando arquivo...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive mb-2">
                Erro ao processar arquivo
              </p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={handleClick}
                variant="outline"
                size="sm"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              Arquivo carregado com sucesso!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
