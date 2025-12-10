# DB Spec Diff AI

Excelで作成されたデータベース定義書の新旧バージョンを比較し、Gemini AIを使用して意味のある差分（テーブル追加、カラム変更、インデックス変更など）を検出・リストアップするツールです。

## 機能

- **Excel解析**: `.xlsx`, `.xls`, `.xlsm` ファイルのパース
- **AI差分分析**: Google Gemini 2.5 Flash モデルを使用したセマンティックな差分検出
- **多言語対応**: 日本語、英語、フランス語に対応
- **直感的なUI**: ドラッグ＆ドロップによるファイルアップロードと分かりやすい結果表示

## 前提条件

ローカル環境で実行するには、以下が必要です。

- **Node.js**: v18以上推奨
- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey) で取得可能（無料枠あり）

## セットアップ手順

1. **リポジトリの準備**
   プロジェクトのディレクトリに移動します。

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   `.env.example` ファイルをコピーして `.env` ファイルを作成し、APIキーを設定します。

   ```bash
   cp .env.example .env
   ```

   `.env` ファイルをテキストエディタで開き、`API_KEY` の値をあなたのGemini APIキーに書き換えてください。
   ```env
   API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 起動方法

### 開発サーバーの起動
以下のコマンドでローカル開発サーバーを起動します。

```bash
npm run dev
```
ブラウザで `http://localhost:5173` にアクセスしてください。

### ビルド
本番用の静的ファイルを生成する場合：

```bash
npm run build
```
`dist` フォルダに生成物が作成されます。

## 技術スタック

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS (CDN)
- **Excel Parsing**: SheetJS (xlsx)
- **AI**: Google GenAI SDK (@google/genai)
- **Icons**: Lucide React

## 注意事項

- APIキーはクライアントサイドのビルドに含まれるため、公開サーバーにデプロイする場合はアクセス制限をかけるか、バックエンドを経由する構成を検討してください。
- Excelファイルの内容はGemini APIに送信されます。機密情報が含まれる場合は注意してください。
