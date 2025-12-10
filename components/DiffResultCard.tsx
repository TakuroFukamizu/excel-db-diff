import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, FileQuestion, Activity } from 'lucide-react';
import { SheetDiffResult, ChangeAction, ChangeType, DiffItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DiffResultCardProps {
  result: SheetDiffResult;
}

const getActionColor = (action: ChangeAction) => {
  switch (action) {
    case ChangeAction.ADDED: return 'bg-green-100 text-green-800 border-green-200';
    case ChangeAction.REMOVED: return 'bg-red-100 text-red-800 border-red-200';
    case ChangeAction.MODIFIED: return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const getTypeBadge = (type: ChangeType) => {
  switch (type) {
    case ChangeType.TABLE: return 'bg-indigo-100 text-indigo-700';
    case ChangeType.COLUMN: return 'bg-cyan-100 text-cyan-700';
    case ChangeType.INDEX: return 'bg-purple-100 text-purple-700';
    case ChangeType.TRIGGER: return 'bg-rose-100 text-rose-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const DiffItemRow: React.FC<{ item: DiffItem }> = ({ item }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 text-sm border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="flex gap-2 min-w-[140px]">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getActionColor(item.action)}`}>
          {t.actions[item.action] || item.action}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(item.type)}`}>
          {t.types[item.type] || item.type}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="font-medium text-slate-900 mb-0.5">{item.target}</div>
        <div className="text-slate-600">{item.description}</div>
        {(item.oldValue || item.newValue) && (
          <div className="mt-2 flex items-center gap-2 text-xs bg-slate-100 p-2 rounded border border-slate-200 font-mono overflow-x-auto">
            {item.oldValue && <span className="text-red-600 line-through opacity-70">{item.oldValue}</span>}
            {item.oldValue && item.newValue && <span className="text-slate-400">→</span>}
            {item.newValue && <span className="text-green-600 font-bold">{item.newValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export const DiffResultCard: React.FC<DiffResultCardProps> = ({ result }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  // Status Icons
  const renderStatusIcon = () => {
    switch (result.status) {
      case 'COMPLETED':
        return result.diffs.length > 0 ? 
          <AlertCircle className="w-5 h-5 text-amber-500" /> : 
          <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'PROCESSING':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'SKIPPED':
        return <FileQuestion className="w-5 h-5 text-slate-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-300" />;
    }
  };

  const hasChanges = result.diffs.length > 0;
  const isError = result.status === 'ERROR';

  const getStatusText = () => {
    if (result.status === 'COMPLETED') {
      return hasChanges 
        ? t.changesDetected.replace('{count}', result.diffs.length.toString()) 
        : t.noChanges;
    }
    return t.status[result.status] || result.status;
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {renderStatusIcon()}
          <div>
            <h3 className="font-semibold text-slate-900">{result.sheetName}</h3>
            <p className="text-xs text-slate-500">{getStatusText()}</p>
          </div>
        </div>
        
        {(hasChanges || isError) && (
          <div className={`p-1 rounded-full ${isOpen ? 'bg-slate-200' : ''}`}>
            {isOpen ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
          </div>
        )}
      </button>

      {isOpen && (hasChanges || isError || result.summary) && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          {isError && (
             <div className="p-4 text-sm text-red-600 bg-red-50">
               <strong>{t.errorPrefix}</strong> {result.error}
             </div>
          )}
          
          {result.summary && (
             <div className="p-4 text-sm text-slate-700 bg-blue-50/50 border-b border-blue-100">
               <span className="font-semibold text-blue-800">{t.summary}: </span>
               {result.summary}
             </div>
          )}

          <div className="divide-y divide-slate-100 bg-white">
            {result.diffs.map((diff, index) => (
              <DiffItemRow key={index} item={diff} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};