import React, { useState, useEffect } from 'react';
import { Sparkles, Download, FileJson, FileType, FileSpreadsheet, RefreshCcw, ArrowRight, Layout } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { DataGrid } from './components/DataGrid';
import { Visualizer } from './components/Visualizer';
import { parseFile, exportFile } from './utils/fileHelpers';
import { analyzeDataset } from './services/geminiService';
import { DataSet, LoadingState, AIInsight, ChartType } from './types';

export default function App() {
  const [dataset, setDataset] = useState<DataSet | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);

  const handleDataLoaded = (data: DataSet) => {
    setDataset(data);
    setInsight(null);
    setActiveSheetIdx(0);
  };

  const activeSheet = dataset?.sheets[activeSheetIdx];

  const runAnalysis = async () => {
    if (!activeSheet) return;
    setLoading('analyzing');
    try {
      const result = await analyzeDataset(activeSheet.data, activeSheet.columns);
      setInsight(result);
    } catch (e) {
      console.error(e);
      // Silent fail or toast could go here, preventing full alert spam
    } finally {
      setLoading('idle');
    }
  };

  // Re-run analysis when active sheet changes
  useEffect(() => {
    if (activeSheet && !insight && loading === 'idle') {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet]);

  const handleSheetChange = (index: number) => {
      if (index !== activeSheetIdx) {
          setInsight(null); // Clear old insight
          setActiveSheetIdx(index);
      }
  };

  const handleReset = () => {
    setDataset(null);
    setInsight(null);
    setLoading('idle');
    setActiveSheetIdx(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 text-white p-1.5 rounded-lg">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
              DataAlchemy
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {dataset && (
                 <button 
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                 >
                    Start Over
                 </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Upload State */}
        {!dataset ? (
          <div className="max-w-2xl mx-auto mt-20 text-center space-y-8">
            <div className="space-y-4">
               <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  Transform & Analyze <br/> 
                  <span className="text-brand-500">Any Dataset</span>
               </h2>
               <p className="text-lg text-gray-500 max-w-xl mx-auto">
                 Convert between CSV, Excel, and JSON instantly. 
                 Let AI discover insights and generate charts for you automatically.
               </p>
            </div>
            
            <DropZone onDataLoaded={handleDataLoaded} setLoading={setLoading} />

            {loading === 'parsing' && (
                <div className="flex items-center justify-center gap-2 text-brand-600 animate-pulse">
                    <RefreshCcw className="animate-spin" size={18} /> Parsing your file...
                </div>
            )}
          </div>
        ) : (
          /* Dashboard State */
          <div className="space-y-6 animate-fade-in">
             
             {/* Toolbar */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="h-10 w-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-bold shrink-0">
                            {dataset.fileType.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{dataset.fileName}</h3>
                            <p className="text-xs text-gray-500">
                                {dataset.sheets.length} Sheets • {activeSheet?.data.length || 0} rows in view
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <span className="hidden md:inline text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Export</span>
                        <button onClick={() => exportFile(dataset, 'csv', activeSheetIdx)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <FileType size={16} className="text-green-600"/> CSV
                        </button>
                        <button onClick={() => exportFile(dataset, 'xlsx')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <FileSpreadsheet size={16} className="text-green-600"/> Excel
                        </button>
                        <button onClick={() => exportFile(dataset, 'json', activeSheetIdx)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <FileJson size={16} className="text-yellow-600"/> JSON
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                {dataset.sheets.length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar border-t border-gray-100 pt-3">
                        <Layout size={16} className="text-gray-400 mr-2 shrink-0" />
                        {dataset.sheets.map((sheet, idx) => (
                            <button
                                key={sheet.name + idx}
                                onClick={() => handleSheetChange(idx)}
                                className={`
                                    px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                                    ${idx === activeSheetIdx 
                                        ? 'bg-brand-100 text-brand-700 shadow-sm ring-1 ring-brand-200' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {sheet.name}
                            </button>
                        ))}
                    </div>
                )}
             </div>

             {/* Main Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Data Table */}
                <div className="lg:col-span-1 space-y-6">
                    {activeSheet && (
                         <DataGrid 
                            data={activeSheet.data} 
                            columns={activeSheet.columns} 
                         />
                    )}
                </div>

                {/* Right Column: AI Insights & Viz */}
                <div className="lg:col-span-1 space-y-6">
                    {loading === 'analyzing' ? (
                        <div className="h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 text-center p-8">
                             <div className="relative">
                                <Sparkles size={48} className="text-brand-300 animate-bounce" />
                                <div className="absolute inset-0 bg-brand-400 blur-xl opacity-20 animate-pulse rounded-full"></div>
                             </div>
                             <h3 className="text-lg font-medium text-gray-900">AI is Analyzing {activeSheet?.name}</h3>
                             <p className="text-gray-500 text-sm max-w-xs">We're looking for trends, summaries, and the best way to visualize this sheet.</p>
                        </div>
                    ) : insight && activeSheet ? (
                        <div className="space-y-6">
                            {/* Insight Card */}
                            <div className="bg-gradient-to-br from-indigo-900 to-brand-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-indigo-200 font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Sparkles size={14}/> AI Summary: {activeSheet.name}
                                    </h3>
                                    <p className="text-lg leading-relaxed font-light text-white/90">
                                        {insight.summary}
                                    </p>
                                    <div className="mt-6 space-y-2">
                                        {insight.keyTrends.map((trend, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm text-indigo-100/80 bg-white/10 p-3 rounded-lg border border-white/5">
                                                <ArrowRight size={16} className="mt-0.5 shrink-0 text-brand-300" />
                                                {trend}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <Visualizer insight={insight} data={activeSheet.data} />
                        </div>
                    ) : (
                         <div className="h-[500px] bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                            Waiting for analysis...
                         </div>
                    )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}