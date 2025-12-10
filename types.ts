export interface ParsedSheet {
  name: string;
  data: any[]; // Raw JSON data from Excel
  csv: string; // CSV representation for LLM
}

export interface WorkbookData {
  fileName: string;
  sheets: Record<string, ParsedSheet>;
}

export enum ChangeType {
  TABLE = 'TABLE',
  COLUMN = 'COLUMN',
  INDEX = 'INDEX',
  TRIGGER = 'TRIGGER',
  CONSTRAINT = 'CONSTRAINT',
  OTHER = 'OTHER'
}

export enum ChangeAction {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
  MODIFIED = 'MODIFIED'
}

export interface DiffItem {
  type: ChangeType;
  action: ChangeAction;
  target: string; // Name of the table/column/object
  description: string; // Human readable description
  oldValue?: string;
  newValue?: string;
}

export interface SheetDiffResult {
  sheetName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR' | 'SKIPPED';
  diffs: DiffItem[];
  summary?: string;
  error?: string;
}

export interface ProcessingState {
  totalSheets: number;
  processedSheets: number;
  currentSheetName: string;
}

export type Language = 'en' | 'ja' | 'fr';