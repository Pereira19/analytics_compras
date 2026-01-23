import { useState, useEffect } from 'react';

export interface Sheet2Record {
  COD: number;
  Fornecedor: string;
  COMPRADOR: string;
  'NIVEL SERVIÇO RUPTURA S/ PENDÊNCIA': number;
  'NIVEL SERVIÇO RUPTURA C/ PENDÊNCIA': number;
  'MÊS S/ PENDÊNCIA': number;
  'MÊS + PENDÊNCIA': number;
  'PRAZO RUPTURA': number;
  'PRAZO EXCESSO': number;
  'VALOR ESTOQUE PREÇO CUSTO': number;
  'VALOR ESTOQUE PREÇO VENDA': number;
  'RUPTURA VALOR A': number;
  'RUPTURA VALOR B': number;
  'RUPTURA VALOR C': number;
  'RUPTURA VALOR': number;
  '% RUPTURA TOTAL': number;
  '% RUPTURA CURVA A': number;
  'EXCESSO VALOR A': number;
  'EXCESSO VALOR B': number;
  'EXCESSO VALOR C': number;
  'EXCESSO VALOR': number;
  '% EXCESSO TOTAL': number;
  '% EXCESSO CURVA B/C': number;
  'SKU INDUSTRIA': number;
  'SKU INDUSTRIA FL': number;
  [key: string]: any;
}

export function useSheet2Data() {
  const [data, setData] = useState<Sheet2Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sheet2_data.json');
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
