import React, { useCallback, useState } from 'react';
import { Upload, FileType, FileSpreadsheet, FileJson } from 'lucide-react';
import { parseFile } from '../utils/fileHelpers';
import { DataSet, LoadingState } from '../types';

interface DropZoneProps {
  onDataLoaded: (data: DataSet) => void;
  setLoading: (state: LoadingState) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onDataLoaded, setLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setLoading('parsing');
    try {
      const dataset = await parseFile(file);
      onDataLoaded(dataset);
    } catch (error) {
      console.error("Failed to parse file", error);
      alert("Error parsing file. Please ensure it is a valid CSV, Excel, or JSON file.");
    } finally {
      setLoading('idle');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
        flex flex-col items-center justify-center gap-4
        ${isDragging 
          ? 'border-brand-500 bg-brand-50 scale-[1.01]' 
          : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50 bg-white'
        }
      `}
    >
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.json,.txt"
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className={`
        p-4 rounded-full transition-colors duration-300
        ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-500'}
      `}>
        <Upload size={32} />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">
          Drop your data file here
        </h3>
        <p className="text-sm text-gray-500">
          Supports CSV, Excel (XLSX), and JSON
        </p>
      </div>

      <div className="flex gap-3 mt-2 text-gray-400">
        <div className="flex items-center gap-1 text-xs">
          <FileSpreadsheet size={14} /> XLSX
        </div>
        <div className="flex items-center gap-1 text-xs">
          <FileType size={14} /> CSV
        </div>
        <div className="flex items-center gap-1 text-xs">
          <FileJson size={14} /> JSON
        </div>
      </div>
    </div>
  );
};
