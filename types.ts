export interface DataRow {
  [key: string]: any;
}

export interface Sheet {
  name: string;
  columns: string[];
  data: DataRow[];
}

export interface DataSet {
  fileName: string;
  sheets: Sheet[];
  fileType: 'csv' | 'xlsx' | 'json';
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
  NONE = 'none'
}

export interface AIInsight {
  summary: string;
  keyTrends: string[];
  suggestedChart: {
    type: ChartType;
    xAxisKey: string;
    dataKeys: string[];
    title: string;
  };
}

export type LoadingState = 'idle' | 'parsing' | 'analyzing' | 'exporting';