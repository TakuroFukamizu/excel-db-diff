import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploaderProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  label, 
  file, 
  onFileSelect, 
  onClear,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Check for xlsx, xls, and xlsm extensions (case-insensitive)
      if (/\.(xlsx|xls|xlsm)$/i.test(droppedFile.name)) {
        onFileSelect(droppedFile);
      } else {
        alert(t.uploadError);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      
      {!file ? (
        <div 
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
            ${disabled ? 'bg-slate-100 border-slate-300 cursor-not-allowed opacity-60' : 'bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-50'}
          `}
        >
          <Upload className="w-8 h-8 text-slate-400" />
          <p className="text-sm text-slate-500 text-center">
            {t.dragDrop}<br/>
            <span className="text-xs text-slate-400">{t.fileType}</span>
          </p>
          <input 
            type="file" 
            ref={inputRef} 
            className="hidden" 
            accept=".xlsx, .xls, .xlsm"
            onChange={(e) => {
              if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
            }}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-green-100 p-2 rounded-md">
              <FileSpreadsheet className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
              <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          {!disabled && (
            <button 
              onClick={onClear}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};