import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { DataSet, DataRow } from '../types';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface DataGridProps {
  dataset: DataSet;
  onDataUpdate?: (newData: DataRow[]) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({ dataset, onDataUpdate }) => {
  const { columns, data } = dataset;

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'text-gray-600 text-sm',
  }), []);

  const columnDefs = useMemo<ColDef[]>(() => {
    return columns.map(col => ({
      field: col,
      headerName: col,
      headerClass: 'bg-gray-50 font-semibold text-gray-500',
    }));
  }, [columns]);

  const onCellValueChanged = useCallback((event: any) => {
    // Propagate changes back to parent
    if (onDataUpdate) {
        // Note: In a very large dataset, cloning this might be expensive,
        // but for client-side edits of reasonable files, this ensures React state consistency.
        // AG Grid modifies the rowData in place, but we need to trigger the state update.
        const updatedData = [];
        event.api.forEachNode((node: any) => updatedData.push(node.data));
        onDataUpdate(updatedData);
    }
  }, [onDataUpdate]);

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Data Editor</h3>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
            {data.length} rows
            </span>
            <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-100">
            Editable
            </span>
        </div>
      </div>
      <div className="flex-1 ag-theme-quartz w-full">
        <AgGridReact
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={100}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            enableCellTextSelection={true}
            animateRows={true}
        />
      </div>
    </div>
  );
};