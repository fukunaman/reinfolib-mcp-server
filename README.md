# 不動産情報MCPサーバー

このプロジェクトは、国土交通省の不動産情報ライブラリのAPIを使用して不動産情報を取得するためのModel Context Protocol（MCP）サーバーです。

## 📋 前提条件

このプロジェクトを始める前に、以下がインストールされていることを確認してください：

- **Node.js** (バージョン18.0.0以上)
- **pnpm** (推奨) または npm
- **Reinfolib API キー** (国土交通省から取得)
- **GISデータ** (N02-22_Station.shp/dbf ファイル、手動でgis/フォルダに配置が必要)

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

### 4. GISデータファイルの配置

駅情報検索機能を使用するには、国土数値情報（鉄道データ）をダウンロードして配置する必要があります。

1. [国土数値情報（鉄道データ）](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v3_1.html)にアクセス
2. 「令和4年度」データの「全国」版をダウンロード（N02-22_Station.zip）
3. ZIPファイルを解凍し、以下のファイルを `gis/` フォルダにコピー：
   - `N02-22_Station.shp`
   - `N02-22_Station.dbf`

```bash
# gisフォルダを作成
mkdir gis

# ダウンロードしたファイルをコピー
cp path/to/downloaded/N02-22_Station.* gis/
```

**注意**: これらのGISファイルは容量が大きいため、Gitリポジトリには含まれていません。各自でダウンロードして配置してください。

### 5. プロジェクトをビルド

```bash
pnpm run build
```

### 6. サーバーを起動

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

### Claude Desktopでの設定

Claude Desktopでこのサーバーを使用するには、設定ファイルを作成してください：

```bash
# 設定ファイルを作成・編集
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

設定ファイルの内容：

```json
{
  "mcpServers": {
    "reinfolib-mcp-server": {
      "command": "node",
      "args": ["path/to/your/reinfolib-mcp-server/dist/server.js"]
    }
  }
}
```

**注意**: 
- `path/to/your/reinfolib-mcp-server` を実際のプロジェクトパスに変更してください

設定完了後、Claude Desktopを再起動してください。

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

#### 7. 駅コード取得 (`get_station_code`)

駅名から駅コードを取得します。不動産取引検索の `station` パラメータに使用できます。

```json
{
  "stationName": "新宿"
}
```

#### 8. 駅情報取得 (`get_station_info`)

駅コードから駅情報（名前、座標等）を取得します。

```json
{
  "stationCode": "003700"
}
```

#### 9. 駅検索 (`search_stations`)

駅名や駅コードで駅を検索します。

```json
{
  "query": "東京"
}
```

## 📁 プロジェクト構造

```
reinfolib-mcp-server/
├── src/
│   ├── server.ts          # メインサーバー実装
│   ├── types.ts           # TypeScript型定義
│   ├── config.ts          # 設定ファイル（都道府県コード等）
│   ├── api/
│   │   └── reinfolib.ts   # Reinfolib API ラッパー
│   └── utils/
│       └── station.ts     # 駅情報関連ユーティリティ
├── gis/
│   ├── N02-22_Station.shp # 駅情報Shapefileデータ
│   └── N02-22_Station.dbf # 駅情報データベース
├── dist/                  # ビルド出力ディレクトリ
├── package.json
├── tsconfig.json
├── .env                   # 環境変数（手動作成）
├── .gitignore             # Git除外設定
├── CLAUDE.md              # Claude Code用ガイダンス
└── README.md
```

## 🗾 GISデータについて

駅情報検索機能では、国土交通省の国土数値情報（鉄道データ）を使用しています：

- **データソース**: 国土交通省 国土数値情報（鉄道）N02-22
- **データ形式**: ESRI Shapefile
- **収録駅数**: 10,220駅
- **文字エンコーディング**: Shift-JIS

### 駅コードの形式

駅コードは6桁の数字で構成されます（例：新宿駅=003700、東京駅=003766）。

## 🔑 APIキーの取得方法

1. [国土交通省 不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)にアクセス
2. アカウントを作成
3. APIキーを申請・取得
4. 取得したAPIキーを `.env` ファイルに設定

## 🎯 使用例

### 駅名から不動産取引を検索

```javascript
// 1. 駅名から駅コードを取得
const stationCode = await getStationCode("新宿");
// 結果: "003700"

// 2. 駅コードを使って不動産取引を検索
const transactions = await searchTransactions({
  year: "2023",
  quarter: "1",
  area: "13",
  station: stationCode
});
```

## 🤝 コントリビューション

バグ報告、機能提案、Pull Requestなど、コントリビューションを歓迎します！

Issue や Pull Request をお気軽に作成してください。
