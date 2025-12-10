import * as XLSX from 'xlsx';
import { ParsedSheet, WorkbookData } from '../types';

export const parseExcelFile = async (file: File): Promise<WorkbookData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const sheets: Record<string, ParsedSheet> = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Convert to JSON for structure
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          // Convert to CSV for token-efficient LLM input
          const csvData = XLSX.utils.sheet_to_csv(worksheet);

          sheets[sheetName] = {
            name: sheetName,
            data: jsonData,
            csv: csvData
          };
        });

        resolve({
          fileName: file.name,
          sheets
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};