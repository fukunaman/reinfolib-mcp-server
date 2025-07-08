# 不動産情報MCPサーバー

このプロジェクトは、国土交通省のReinfolib APIを使用して不動産情報を取得するためのModel Context Protocol（MCP）サーバーです。

## 📋 前提条件

このプロジェクトを始める前に、以下がインストールされていることを確認してください：

- **Node.js** (バージョン18.0.0以上)
- **pnpm** (推奨) または npm
- **Reinfolib API キー** (国土交通省から取得)

## 🚀 クイックスタート

### 1. プロジェクトをクローンまたはダウンロード

```bash
# GitHubからクローンする場合
git clone https://github.com/your-username/reinfolib-mcp-server.git
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

## 📝 重要な注意事項

### タイル座標について

ポイントAPI（`search_land_price_points`, `search_real_estate_price_points`）では、タイル座標（z, x, y）を指定する必要があります：

- **公式例座標**: `z=13, x=7312, y=3008`
- **タイル座標変換ツール**: https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/
- **ズームレベル**: 11-15（高いほど詳細エリア）

### 期間指定の形式

**不動産価格ポイントAPI** では、期間をYYYYN形式で指定します：
- `"20223"` = 2022年第3四半期
- `"20234"` = 2023年第4四半期
- 四半期: 1=1-3月, 2=4-6月, 3=7-9月, 4=10-12月

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. "REINFOLIB_API_KEY environment variable is required" エラー

**原因**: APIキーが設定されていません。

**解決方法**: 
- `.env` ファイルが存在することを確認
- APIキーが正しく設定されていることを確認
- `.env` ファイルがプロジェクトルートにあることを確認

#### 2. ポイントAPIで400エラーが発生する

**原因**: タイル座標や期間形式が正しくない可能性があります。

**解決方法**:
- 公式例座標 `z=13, x=7312, y=3008` を使用
- 期間形式をYYYYN（5桁）で指定（例: "20223"）
- 最小期間: 20053（2005年第3四半期）以降

#### 3. "Result too long, truncated" エラー

**原因**: レスポンスデータが大きすぎます（Claude Desktop の100,000文字制限）。

**解決方法**:
- より高いズームレベル（z=14, z=15）を指定してエリアを絞る
- 期間を短縮する
- より具体的なフィルター条件を追加

#### 4. ビルドエラーが発生する

**解決方法**:
```bash
# 依存関係を再インストール
pnpm install

# ビルドファイルをクリーンして再ビルド
pnpm run clean
pnpm run build
```

#### 5. Node.jsのバージョンエラー

**解決方法**: Node.js 18.0.0以上にアップグレードしてください。

## 📚 参考資料

- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io/)
- [国土交通省 不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/)

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストや Issue の報告を歓迎します。プロジェクトの改善にご協力ください。

---

## 📞 サポート

問題が発生した場合や質問がある場合は、GitHub Issues でお気軽にお問い合わせください。
