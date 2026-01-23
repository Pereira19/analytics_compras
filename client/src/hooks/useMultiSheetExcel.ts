import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface SheetData {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
  stats: {
    totalRows: number;
    numericColumns: string[];
    textColumns: string[];
  };
}

export interface MultiSheetData {
  sheets: SheetData[];
  sheetNames: string[];
}

export interface ParseError {
  message: string;
  code: string;
}

export function useMultiSheetExcel() {
  const [data, setData] = useState<MultiSheetData | null>(null);
  const [error, setError] = useState<ParseError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseExcel = useCallback(async (file: File, sheetIndices?: number[]): Promise<MultiSheetData | null> => {
    setIsLoading(true);
    setError(null);

    try {
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

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Selecionar abas (padrão: primeiras 4)
      const indicesToProcess = sheetIndices || [0, 1, 2, 3];
      const sheetsToProcess = workbook.SheetNames
        .slice(0, Math.max(...indicesToProcess) + 1)
        .filter((_, idx) => indicesToProcess.includes(idx));

      const sheets: SheetData[] = [];

      for (const sheetName of sheetsToProcess) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

        if (jsonData.length === 0) {
          continue;
        }

        const headers = Object.keys(jsonData[0] || {});
        
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

        sheets.push({
          name: sheetName,
          headers,
          rows: jsonData as Record<string, any>[],
          stats: {
            totalRows: jsonData.length,
            numericColumns,
            textColumns
          }
        });
      }

      if (sheets.length === 0) {
        throw new Error('Nenhuma aba com dados válidos encontrada');
      }

      const multiSheetData: MultiSheetData = {
        sheets,
        sheetNames: sheets.map(s => s.name)
      };

      setData(multiSheetData);
      setIsLoading(false);
      return multiSheetData;
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
