import { useEffect, useState } from 'react';

export interface Sheet4CompleteRecord {
  COD: number;
  FORNECEDOR: string;
  'COMPRADOR 01/26': string;
  'FORNECEDOR RESUMIDO': string;
  'COMPRADOR RESUMIDO': string;
  'COD.1': number;
  'STATUS DA MARCA': string;
  'PROJETO MARGEM': number;
  'PROJETO VALOR': number;
  JAN: number;
  FEV: number;
  MAR: number;
  ABR: number;
  MAI: number;
  JUN: number;
  JUL: number;
  AGO: number;
  SET: number;
  OUT: number;
  NOV: number;
  DEZ: number;
  monthValue?: number; // Campo opcional para filtro de mês
}

interface UseSheet4CompleteDataReturn {
  data: Sheet4CompleteRecord[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useSheet4CompleteData(): UseSheet4CompleteDataReturn {
  const [data, setData] = useState<Sheet4CompleteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/sheet4_complete_data.json');
      if (!response.ok) {
        throw new Error('Falha ao carregar dados');
      }
      
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, isLoading, error, refreshData: loadData };
}
