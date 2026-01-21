import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  stats: {
    totalRows: number;
    numericColumns: string[];
    textColumns: string[];
  };
}

export interface ParseError {
  message: string;
  code: string;
}

export function useExcelParser() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<ParseError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseExcel = useCallback(async (file: File): Promise<ParsedData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar tipo de arquivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      const isValidType = validTypes.includes(file.type) || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls') || 
                         file.name.endsWith('.csv');

      if (!isValidType) {
        throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
      }

      let jsonData: any[] = [];

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Processar CSV
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false
        });

        if (result.errors.length > 0) {
          throw new Error('Erro ao processar arquivo CSV');
        }

        jsonData = result.data as any[];
      } else {
        // Processar Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Pegar primeira sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('Arquivo Excel não contém planilhas');
        }

        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      if (jsonData.length === 0) {
        throw new Error('Arquivo vazio ou sem dados válidos');
      }

      // Extrair headers
      const headers = Object.keys(jsonData[0]);
      
      // Classificar colunas por tipo
      const numericColumns: string[] = [];
      const textColumns: string[] = [];
      
      headers.forEach(header => {
        const values = jsonData.map((row: any) => row[header]);
        const isNumeric = values.every((val: any) => 
          val === null || val === undefined || val === '' || !isNaN(Number(val))
        );
        
        if (isNumeric && values.some((val: any) => val !== null && val !== undefined && val !== '')) {
          numericColumns.push(header);
        } else {
          textColumns.push(header);
        }
      });

      const parsedData: ParsedData = {
        headers,
        rows: jsonData,
        stats: {
          totalRows: jsonData.length,
          numericColumns,
          textColumns
        }
      };

      setData(parsedData);
      setIsLoading(false);
      return parsedData;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido ao processar arquivo';
      setError({ message: errorMsg, code: 'PARSE_ERROR' });
      setIsLoading(false);
      return null;
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    isLoading,
    parseExcel,
    clearData
  };
}
