import { useState, useEffect } from 'react';

export interface Sheet1Record {
  Filial: number | null;
  BARRAS: number | null;
  'CODIGO PRINCIPAL': number | null;
  'Código Produto': number | null;
  DESCRIÇÃO: string | null;
  'COD. FORNEC': number | null;
  FORNECEDOR: string | null;
  COMPRADOR: string | null;
  'COD COMPRADOR': number | null;
  'COD. MARCA': number | null;
  MARCA: string | null;
  'COD. DEP.': number | null;
  DEPARTAMENTO: string | null;
  'COD. SESSÃO': number | null;
  SESSÃO: string | null;
  'COD. LINHA': number | null;
  LINHA: string | null;
  'CURVA ABC': string | null;
  'FORA DE LINHA': string | null;
  CLASSE: string | null;
  'ESTOQUE DISPONÍVEL': number | null;
  'QUANTIDADE PEDIDA PENDENTE': number | null;
  AVARIADO: number | null;
  BLOQUEADO: number | null;
  RESERVADO: number | null;
  'QUANTIDADE VENDIDA TRI': number | null;
  'GIRO MÉDIO MENSAL': number | null;
  'GIRO DIA': number | null;
  'DATA ULTIMA ENTRADA': string | null;
  [key: string]: any;
}

export function useSheet1Data() {
  const [data, setData] = useState<Sheet1Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sheet1_data.json');
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
