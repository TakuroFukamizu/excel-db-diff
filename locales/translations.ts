import { ChangeType, ChangeAction } from '../types';

export const translations = {
  en: {
    appTitle: "DB Spec Diff AI",
    appSubtitle: "Upload your old and new Database Definition Excel files. AI will analyze semantic changes in tables, columns, and indexes.",
    oldVersion: "1. Old Version",
    newVersion: "2. New Version",
    dragDrop: "Click to upload or drag & drop",
    fileType: "Excel files (.xlsx, .xls, .xlsm)",
    uploadError: "Please upload an Excel file (.xlsx, .xls, .xlsm)",
    parseError: "Failed to parse Excel file.",
    analyzing: "Analyzing Sheet",
    compare: "Compare Versions",
    resultsTitle: "Comparison Results",
    processed: "processed",
    readyMessage: "Ready to compare. Click the button above to start AI analysis.",
    summary: "Summary",
    changesDetected: "{count} changes detected",
    noChanges: "No changes detected",
    exactMatch: "No changes detected (Exact match).",
    sheetAdded: "Entire sheet added.",
    sheetRemoved: "Entire sheet removed.",
    sheetAddedDesc: "New sheet added to the specification",
    sheetRemovedDesc: "Sheet removed from the specification",
    errorPrefix: "Error:",
    unknownError: "Unknown error",
    status: {
      PENDING: "pending",
      PROCESSING: "processing",
      COMPLETED: "completed",
      ERROR: "error",
      SKIPPED: "skipped"
    },
    types: {
      [ChangeType.TABLE]: "Table",
      [ChangeType.COLUMN]: "Column",
      [ChangeType.INDEX]: "Index",
      [ChangeType.TRIGGER]: "Trigger",
      [ChangeType.CONSTRAINT]: "Constraint",
      [ChangeType.OTHER]: "Other"
    },
    actions: {
      [ChangeAction.ADDED]: "Added",
      [ChangeAction.REMOVED]: "Removed",
      [ChangeAction.MODIFIED]: "Modified"
    }
  },
  ja: {
    appTitle: "DB仕様書差分 AI",
    appSubtitle: "新旧のデータベース定義書（Excel）をアップロードしてください。AIがテーブル、カラム、インデックスなどの意味的な変更を解析します。",
    oldVersion: "1. 旧バージョン",
    newVersion: "2. 新バージョン",
    dragDrop: "クリックしてアップロード、またはドラッグ＆ドロップ",
    fileType: "Excelファイル (.xlsx, .xls, .xlsm)",
    uploadError: "Excelファイルをアップロードしてください (.xlsx, .xls, .xlsm)",
    parseError: "Excelファイルの解析に失敗しました。",
    analyzing: "シート解析中",
    compare: "差分比較を開始",
    resultsTitle: "比較結果",
    processed: "完了",
    readyMessage: "準備完了。上のボタンをクリックしてAI解析を開始してください。",
    summary: "サマリー",
    changesDetected: "{count}件の変更",
    noChanges: "変更なし",
    exactMatch: "変更なし（完全一致）",
    sheetAdded: "シート追加",
    sheetRemoved: "シート削除",
    sheetAddedDesc: "仕様書に新しいシートが追加されました",
    sheetRemovedDesc: "仕様書からシートが削除されました",
    errorPrefix: "エラー:",
    unknownError: "不明なエラー",
    status: {
      PENDING: "待機中",
      PROCESSING: "処理中",
      COMPLETED: "完了",
      ERROR: "エラー",
      SKIPPED: "スキップ"
    },
    types: {
      [ChangeType.TABLE]: "テーブル",
      [ChangeType.COLUMN]: "カラム",
      [ChangeType.INDEX]: "インデックス",
      [ChangeType.TRIGGER]: "トリガー",
      [ChangeType.CONSTRAINT]: "制約",
      [ChangeType.OTHER]: "その他"
    },
    actions: {
      [ChangeAction.ADDED]: "追加",
      [ChangeAction.REMOVED]: "削除",
      [ChangeAction.MODIFIED]: "変更"
    }
  },
  fr: {
    appTitle: "IA Diff Spec BD",
    appSubtitle: "Téléchargez vos anciens et nouveaux fichiers de définition de base de données Excel. L'IA analysera les changements sémantiques dans les tables, colonnes et index.",
    oldVersion: "1. Ancienne Version",
    newVersion: "2. Nouvelle Version",
    dragDrop: "Cliquez pour télécharger ou glisser-déposer",
    fileType: "Fichiers Excel (.xlsx, .xls, .xlsm)",
    uploadError: "Veuillez télécharger un fichier Excel (.xlsx, .xls, .xlsm)",
    parseError: "Échec de l'analyse du fichier Excel.",
    analyzing: "Analyse de la feuille",
    compare: "Comparer les versions",
    resultsTitle: "Résultats de la comparaison",
    processed: "traité",
    readyMessage: "Prêt à comparer. Cliquez sur le bouton ci-dessus pour lancer l'analyse IA.",
    summary: "Résumé",
    changesDetected: "{count} changements détectés",
    noChanges: "Aucun changement détecté",
    exactMatch: "Aucun changement détecté (Correspondance exacte).",
    sheetAdded: "Feuille entière ajoutée.",
    sheetRemoved: "Feuille entière supprimée.",
    sheetAddedDesc: "Nouvelle feuille ajoutée à la spécification",
    sheetRemovedDesc: "Feuille supprimée de la spécification",
    errorPrefix: "Erreur:",
    unknownError: "Erreur inconnue",
    status: {
      PENDING: "en attente",
      PROCESSING: "traitement",
      COMPLETED: "terminé",
      ERROR: "erreur",
      SKIPPED: "ignoré"
    },
    types: {
      [ChangeType.TABLE]: "Table",
      [ChangeType.COLUMN]: "Colonne",
      [ChangeType.INDEX]: "Index",
      [ChangeType.TRIGGER]: "Déclencheur",
      [ChangeType.CONSTRAINT]: "Contrainte",
      [ChangeType.OTHER]: "Autre"
    },
    actions: {
      [ChangeAction.ADDED]: "Ajouté",
      [ChangeAction.REMOVED]: "Supprimé",
      [ChangeAction.MODIFIED]: "Modifié"
    }
  }
};