import * as XLSX from 'xlsx';
import { DataSet, DataRow, Sheet } from '../types';

export const parseFile = async (file: File): Promise<DataSet> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File is empty");

        let workbook: XLSX.WorkBook;
        const sheets: Sheet[] = [];
        
        if (file.name.endsWith('.json')) {
           const jsonData = JSON.parse(data as string);
           // Handle array of objects or single object
           const rows = Array.isArray(jsonData) ? jsonData : [jsonData];
           const sheet = XLSX.utils.json_to_sheet(rows);
           workbook = XLSX.utils.book_new();
           XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
        } else {
           workbook = XLSX.read(data, { type: 'binary' });
        }

        // Iterate through all sheets
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet, { defval: "" });
            
            if (jsonData.length > 0) {
                sheets.push({
                    name: sheetName,
                    columns: Object.keys(jsonData[0]),
                    data: jsonData
                });
            }
        });

        // Fallback if no valid data found
        if (sheets.length === 0) {
            sheets.push({
                name: 'Sheet1',
                columns: [],
                data: []
            });
        }

        resolve({
          fileName: file.name,
          sheets,
          fileType: getFileType(file.name)
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file); // Better for CSV encoding
    } else if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

const getFileType = (fileName: string): 'csv' | 'xlsx' | 'json' => {
    if (fileName.endsWith('.csv')) return 'csv';
    if (fileName.endsWith('.json')) return 'json';
    return 'xlsx';
};

export const exportFile = (dataset: DataSet, format: 'csv' | 'xlsx' | 'json', activeSheetIndex: number = 0) => {
    const activeSheet = dataset.sheets[activeSheetIndex];

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(activeSheet.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        downloadLink(url, `${dataset.fileName.split('.')[0]}_${activeSheet.name}.json`);
        return;
    }

    const workbook = XLSX.utils.book_new();

    if (format === 'xlsx') {
        // Export all sheets for XLSX
        dataset.sheets.forEach(sheet => {
            const worksheet = XLSX.utils.json_to_sheet(sheet.data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
        });
        XLSX.writeFile(workbook, `${dataset.fileName.split('.')[0]}_converted.xlsx`);
    } else {
        // Export only active sheet for CSV
        const worksheet = XLSX.utils.json_to_sheet(activeSheet.data);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        downloadLink(url, `${dataset.fileName.split('.')[0]}_${activeSheet.name}.csv`);
    }
};

const downloadLink = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};