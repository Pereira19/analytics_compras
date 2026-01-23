import { useState, useEffect } from 'react';

export interface Sheet3Record {
  COMPRADOR: string;
  'NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA': number | null;
  'NIVEL SERVIÇO RUPTURA C/ PENDÊNCIA': number | null;
  'MÊS S/ PENDÊNCIA': number | null;
  'MÊS + PENDÊNCIA': number | null;
  'PRAZO RUPTURA': number | null;
  'PRAZO EXCESSO': number | null;
  'VALOR ESTOQUE PREÇO CUSTO': number | null;
  'VALOR ESTOQUE PREÇO VENDA': number | null;
  'RUPTURA VALOR A': number | null;
  'RUPTURA VALOR B': number | null;
  'RUPTURA VALOR C': number | null;
  'RUPTURA VALOR': number | null;
  '% RUPTURA TOTAL': number | null;
  '% RUPTURA CURVA A': number | null;
  'EXCESSO VALOR A': number | null;
  'EXCESSO VALOR B': number | null;
  'EXCESSO VALOR C': number | null;
  'EXCESSO VALOR': number | null;
  '% EXCESSO TOTAL': number | null;
  '% EXCESSO CURVA B/C': number | null;
  'SKU INDUSTRIA': number | null;
  'SKU INDUSTRIA FL': number | null;
  'SKU INDUSTRIA ATIVOS': number | null;
  PMP: number | null;
  [key: string]: any;
}

export function useSheet3Data() {
  const [data, setData] = useState<Sheet3Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sheet3_data.json');
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
