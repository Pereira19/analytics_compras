import { useState, useEffect } from 'react';

export interface Sheet4Record {
  COD: number;
  FORNECEDOR: string;
  'COMPRADOR 01/26': string;
  'FORNECEDOR RESUMIDO': string;
  'COMPRADOR RESUMIDO': string;
  'COD.1': number;
  'STATUS DA MARCA': string;
  'PROJETO MARGEM': number;
  'PROJETO VALOR': number;
  [key: string]: any;
}

export function useSheet4Data() {
  const [data, setData] = useState<Sheet4Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sheet4_data.json');
        if (!response.ok) {
          throw new Error('Erro ao carregar dados');
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, isLoading, error };
}
