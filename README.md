# DB Spec Diff AI

Excelで作成されたデータベース定義書の新旧バージョンを比較し、AIを使用して意味のある差分（テーブル追加、カラム変更、インデックス変更など）を検出・リストアップするツールです。

## 機能

- **Excel解析**: `.xlsx`, `.xls`, `.xlsm` ファイルのパース
- **AI差分分析**: Gemini, OpenAI, Claude, またはローカルLLM (LM Studio等) を使用可能
- **多言語対応**: 日本語、英語、フランス語に対応
- **直感的なUI**: ドラッグ＆ドロップによるファイルアップロードと分かりやすい結果表示
- **レポート出力**: Markdown形式でのダウンロード機能

## 前提条件

ローカル環境で実行するには、Node.js (v18以上) が必要です。

## セットアップ手順

1. **リポジトリの準備**
   プロジェクトのディレクトリに移動します。

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   `.env.example` ファイルをコピーして `.env` ファイルを作成し、必要な変数を設定します。

   ```bash
   cp .env.example .env
   ```

   `.env` ファイルを編集して、使用するLLMプロバイダーとAPIキーを設定してください。

   ### 設定例

   **Gemini (デフォルト)**
   ```env
   LLM_PROVIDER=gemini
   API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MODEL_NAME=gemini-2.5-flash
   ```

   **Local LLM (LM Studioなど)**
   LM Studioなどでローカルサーバーを起動し、OpenAI互換のエンドポイントを指定します。
   ```env
   LLM_PROVIDER=local
   API_BASE_URL=http://localhost:1234/v1
   MODEL_NAME=your-loaded-model-name
   API_KEY=dummy
   ```

   **OpenAI**
   ```env
   LLM_PROVIDER=openai
   API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MODEL_NAME=gpt-4o
   ```

   **Anthropic (Claude)**
   ※クライアントサイドからの直接実行はCORSの問題が発生する場合があるため、開発環境での利用を推奨します。
   ```env
   LLM_PROVIDER=anthropic
   API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MODEL_NAME=claude-3-5-sonnet-latest
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
- **AI Integration**:
  - Google GenAI SDK (Gemini)
  - Fetch API (OpenAI, Anthropic, Local)

## 注意事項

- APIキーはクライアントサイドのビルドに含まれるため、公開サーバーにデプロイする場合はアクセス制限をかけるか、バックエンドを経由する構成を検討してください。
- Excelファイルの内容は選択したAIプロバイダーに送信されます。機密情報が含まれる場合は注意してください。
