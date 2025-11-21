import * as XLSX from 'xlsx';
import { DataSet, DataRow } from '../types';

export const parseFile = async (file: File): Promise<DataSet> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File is empty");

        let workbook: XLSX.WorkBook;
        
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

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // raw: false tries to format, but true is safer for analysis usually. 
        // We use default generic JSON conversion
        const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet, { defval: "" });

        if (jsonData.length === 0) {
            resolve({
                fileName: file.name,
                columns: [],
                data: [],
                fileType: getFileType(file.name)
            });
            return;
        }

        const columns = Object.keys(jsonData[0]);

        resolve({
          fileName: file.name,
          columns,
          data: jsonData,
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

export const exportFile = (dataset: DataSet, format: 'csv' | 'xlsx' | 'json') => {
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataset.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        downloadLink(url, `${dataset.fileName.split('.')[0]}_converted.json`);
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataset.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    if (format === 'csv') {
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        downloadLink(url, `${dataset.fileName.split('.')[0]}_converted.csv`);
    } else {
        XLSX.writeFile(workbook, `${dataset.fileName.split('.')[0]}_converted.xlsx`);
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
