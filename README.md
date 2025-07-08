# 不動産情報MCPサーバー

このプロジェクトは、国土交通省の不動産情報ライブラリのAPIを使用して不動産情報を取得するためのModel Context Protocol（MCP）サーバーです。

## 📋 前提条件

このプロジェクトを始める前に、以下がインストールされていることを確認してください：

- **Node.js** (バージョン18.0.0以上)
- **pnpm** (推奨) または npm
- **Reinfolib API キー** (国土交通省から取得)

## 🚀 クイックスタート

### 1. プロジェクトをクローンまたはダウンロード

```bash
# GitHubからクローンする場合
git clone https://github.com/fukunaman/reinfolib-mcp-server.git
cd reinfolib-mcp-server

# またはZIPファイルをダウンロードして展開
```

### 2. 依存関係をインストール

```bash
# pnpmを使用（推奨）
pnpm install

# または npm を使用
npm install
```

### 3. 環境変数を設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の内容を記述してください：

```env
REINFOLIB_API_KEY=your_api_key_here
```

**重要**: `your_api_key_here` を実際のReinfolib APIキーに置き換えてください。

### 4. プロジェクトをビルド

```bash
pnpm run build
```

### 5. サーバーを起動

```bash
# 本番環境での起動
pnpm run start

# または開発環境での起動（自動リロード有効）
pnpm run dev
```

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `pnpm install` | 依存関係をインストール |
| `pnpm run build` | TypeScriptをJavaScriptにコンパイル |
| `pnpm run start` | ビルドされたサーバーを起動 |
| `pnpm run dev` | 開発モードでサーバーを起動 |
| `pnpm run clean` | ビルドファイルを削除 |

## 📖 使用方法

### MCPクライアントとの接続

このサーバーは標準入出力（stdio）を使用してMCPクライアントと通信します。Claude DesktopやCursorなどのMCPクライアントから接続できます。

### 利用可能なツール

#### 1. 不動産取引情報の検索 (`search_transactions`)

```json
{
  "year": "2023",
  "quarter": "1",
  "area": "13",
  "city": "13101"
}
```

#### 2. 市区町村一覧の取得 (`get_municipalities`)

```json
{
  "prefectureCode": "13"
}
```

#### 3. 地価公示情報の検索 (`search_appraisals`)

```json
{
  "year": "2023",
  "area": "13",
  "division": "00"
}
```

#### 4. 地価公示ポイント情報の検索 (`search_land_price_points`)

```json
{
  "z": 13,
  "x": 7312,
  "y": 3008,
  "year": "2020"
}
```

#### 5. 不動産価格ポイント情報の検索 (`search_real_estate_price_points`)

```json
{
  "z": 13,
  "x": 7312,
  "y": 3008,
  "from": "20223",
  "to": "20234"
}
```

#### 6. プロパティ検索 (`search_properties`)

```json
{
  "prefecture": "13",
  "year": "2023"
}
```

## 📁 プロジェクト構造

```
reinfolib-mcp-server-server/
├── src/
│   ├── server.ts          # メインサーバー実装
│   ├── types.ts           # TypeScript型定義
│   ├── config.ts          # 設定ファイル（都道府県コード等）
│   ├── api/
│   │   └── reinfolib.ts   # Reinfolib API ラッパー
│   └── utils/
│       └── validation.ts  # ユーティリティ関数
├── dist/                  # ビルド出力ディレクトリ
├── package.json
├── tsconfig.json
├── .env                   # 環境変数（手動作成）
├── .gitignore             # Git除外設定
├── CLAUDE.md              # Claude Code用ガイダンス
└── README.md
```

## 🔑 APIキーの取得方法

1. [国土交通省 不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)にアクセス
2. アカウントを作成
3. APIキーを申請・取得
4. 取得したAPIキーを `.env` ファイルに設定
