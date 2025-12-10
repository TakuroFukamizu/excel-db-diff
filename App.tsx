import React, { useState, useCallback } from 'react';
import { Database, Zap, RefreshCw, FileDiff, Globe } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { DiffResultCard } from './components/DiffResultCard';
import { parseExcelFile } from './services/excelService';
import { analyzeSheetDiff } from './services/geminiService';
import { WorkbookData, SheetDiffResult, ProcessingState, Language } from './types';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [oldWorkbook, setOldWorkbook] = useState<WorkbookData | null>(null);
  const [newWorkbook, setNewWorkbook] = useState<WorkbookData | null>(null);
  
  const [results, setResults] = useState<SheetDiffResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    totalSheets: 0,
    processedSheets: 0,
    currentSheetName: ''
  });

  const { language, setLanguage, t } = useLanguage();

  const handleOldFileSelect = async (file: File) => {
    setOldFile(file);
    try {
      const data = await parseExcelFile(file);
      setOldWorkbook(data);
    } catch (e) {
      console.error(e);
      alert(t.parseError);
      setOldFile(null);
    }
  };

  const handleNewFileSelect = async (file: File) => {
    setNewFile(file);
    try {
      const data = await parseExcelFile(file);
      setNewWorkbook(data);
    } catch (e) {
      console.error(e);
      alert(t.parseError);
      setNewFile(null);
    }
  };

  const handleProcessDiff = useCallback(async () => {
    if (!oldWorkbook || !newWorkbook) return;

    setIsProcessing(true);
    setResults([]);
    
    // Identify all unique sheet names
    const allSheets = new Set([
      ...Object.keys(oldWorkbook.sheets),
      ...Object.keys(newWorkbook.sheets)
    ]);
    
    const sheetNames = Array.from(allSheets);
    setProcessingState({
      totalSheets: sheetNames.length,
      processedSheets: 0,
      currentSheetName: ''
    });

    const newResults: SheetDiffResult[] = [];

    // Initialize result placeholders
    sheetNames.forEach(name => {
      newResults.push({
        sheetName: name,
        status: 'PENDING',
        diffs: []
      });
    });
    setResults([...newResults]);

    // Process sequentially to avoid rate limits and keep UI responsive
    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      setProcessingState(prev => ({ ...prev, currentSheetName: sheetName }));

      // Update current sheet to PROCESSING
      setResults(prev => prev.map(r => r.sheetName === sheetName ? { ...r, status: 'PROCESSING' } : r));

      const oldSheet = oldWorkbook.sheets[sheetName];
      const newSheet = newWorkbook.sheets[sheetName];

      try {
        if (!oldSheet && newSheet) {
          // Sheet Added
          setResults(prev => prev.map(r => r.sheetName === sheetName ? {
            ...r,
            status: 'COMPLETED',
            summary: t.sheetAdded,
            diffs: [{
              type: 'OTHER' as any,
              action: 'ADDED' as any,
              target: 'Sheet',
              description: t.sheetAddedDesc
            }]
          } : r));
        } else if (oldSheet && !newSheet) {
          // Sheet Removed
          setResults(prev => prev.map(r => r.sheetName === sheetName ? {
            ...r,
            status: 'COMPLETED',
            summary: t.sheetRemoved,
            diffs: [{
              type: 'OTHER' as any,
              action: 'REMOVED' as any,
              target: 'Sheet',
              description: t.sheetRemovedDesc
            }]
          } : r));
        } else {
          // Both exist - Deep Compare with Gemini
          // Check for exact CSV match first to save tokens
          if (oldSheet.csv === newSheet.csv) {
            setResults(prev => prev.map(r => r.sheetName === sheetName ? {
              ...r,
              status: 'COMPLETED',
              diffs: [],
              summary: t.exactMatch
            } : r));
          } else {
            // AI Analysis
            const aiResult = await analyzeSheetDiff(sheetName, oldSheet.csv, newSheet.csv, language);
            
            setResults(prev => prev.map(r => r.sheetName === sheetName ? {
              ...r,
              status: 'COMPLETED',
              diffs: aiResult.diffs,
              summary: aiResult.summary
            } : r));
          }
        }
      } catch (error) {
        setResults(prev => prev.map(r => r.sheetName === sheetName ? {
          ...r,
          status: 'ERROR',
          error: error instanceof Error ? error.message : t.unknownError
        } : r));
      }

      setProcessingState(prev => ({
        ...prev,
        processedSheets: prev.processedSheets + 1
      }));
    }

    setIsProcessing(false);
  }, [oldWorkbook, newWorkbook, language, t]);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-8 max-w-5xl mx-auto">
      
      {/* Header with Language Selector */}
      <div className="w-full flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <Globe className="w-4 h-4 text-slate-500 ml-2" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer py-1 pr-8 pl-2"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <div className="text-center mb-10 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {t.appTitle}
          </h1>
        </div>
        <p className="text-slate-500 max-w-lg mx-auto">
          {t.appSubtitle}
        </p>
      </div>

      {/* Upload Section */}
      <div className="w-full grid md:grid-cols-2 gap-6 mb-8">
        <FileUploader 
          label={t.oldVersion}
          file={oldFile}
          onFileSelect={handleOldFileSelect}
          onClear={() => { setOldFile(null); setOldWorkbook(null); }}
          disabled={isProcessing}
        />
        <FileUploader 
          label={t.newVersion}
          file={newFile}
          onFileSelect={handleNewFileSelect}
          onClear={() => { setNewFile(null); setNewWorkbook(null); }}
          disabled={isProcessing}
        />
      </div>

      {/* Action Section */}
      <div className="w-full flex justify-center mb-12">
        <button
          onClick={handleProcessDiff}
          disabled={!oldWorkbook || !newWorkbook || isProcessing}
          className={`
            relative group flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all
            ${!oldWorkbook || !newWorkbook 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : isProcessing 
                ? 'bg-slate-800 text-slate-200 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-2xl hover:scale-105 active:scale-95'}
          `}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t.analyzing} {processingState.processedSheets + 1}/{processingState.totalSheets}...</span>
            </>
          ) : (
            <>
              <Zap className={`w-5 h-5 ${oldWorkbook && newWorkbook ? 'fill-yellow-400 text-yellow-100' : ''}`} />
              <span>{t.compare}</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      <div className="w-full space-y-4">
        {results.length > 0 && (
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <FileDiff className="w-6 h-6 text-slate-500" />
               {t.resultsTitle}
             </h2>
             <span className="text-sm text-slate-500">
               {results.filter(r => r.status === 'COMPLETED').length} {t.processed}
             </span>
           </div>
        )}

        {results.map((result) => (
          <DiffResultCard key={result.sheetName} result={result} />
        ))}
        
        {results.length === 0 && !isProcessing && oldWorkbook && newWorkbook && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-slate-400">{t.readyMessage}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default App;