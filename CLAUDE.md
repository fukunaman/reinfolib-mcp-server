# CLAUDE.md

このファイルは、このリポジトリのコードで作業する際にClaude Code (claude.ai/code)にガイダンスを提供します。

## プロジェクト概要

これは、国土交通省（MLIT）のReinfoli APIを通じて不動産情報を提供するModel Context Protocol（MCP）サーバーです。このサーバーは、MCPプロトコルを通じて物件検索と詳細情報取得機能を公開します。

## アーキテクチャ

- **MCPサーバー**: `src/server.ts` - MCP SDKを使用したメインサーバーの実装
- **APIレイヤー**: `src/api/reinfolib.ts` - Reinfolib APIのラッパー
- **型定義**: `src/types.ts` - 物件データと検索パラメータ用のTypeScriptインターフェース
- **トランスポート**: MCPクライアントとの通信にstdioトランスポートを使用

サーバーは以下の6つのメインツールを提供します：
- `search_transactions`: 不動産取引価格情報の検索（XIT001）
- `search_properties`: 様々なフィルターで物件を検索（XIT001ラッパー）
- `get_municipalities`: 都道府県内の市区町村一覧取得（XIT002）
- `search_appraisals`: 地価公示情報の検索（XCT001）
- `search_land_price_points`: 地価公示・地価調査のポイント（点）情報（XPT002）
- `search_real_estate_price_points`: 不動産価格（取引価格・成約価格）のポイント（点）情報（XPT001）

## 開発コマンド

```bash
# 依存関係をインストール
pnpm install

# プロジェクトをビルド
pnpm run build

# 開発モードで実行
pnpm run dev

# 本番ビルドを実行
pnpm run start

# ビルド成果物をクリーン
pnpm run clean
```

## 環境設定

API認証のために`.env`ファイルに`REINFOLIB_API_KEY`環境変数を設定する必要があります。

## 利用可能なReinfolib API

### 不動産取引API
- **XIT001**: 不動産取引・売買価格情報
  - パラメータ: `year`, `quarter`, `area` (都道府県コード), `city` (市区町村コード), `station`
  - 戻り値: 価格、物件詳細、立地情報を含む取引データ

- **XIT002**: 都道府県内の市区町村一覧
  - パラメータ: `area` (都道府県コード)
  - 戻り値: コードと名称を含む市区町村リスト

### 鑑定・土地情報API
- **XCT001**: 土地鑑定報告書情報
  - パラメータ: `year`, `area` (都道府県コード), `division` (土地利用区分)
  - 戻り値: 公式土地鑑定価格と物件特性

### ポイント（点）API
- **XPT001**: 不動産価格（取引価格・成約価格）情報のポイント（点）API
  - パラメータ: `response_format`, `z`, `x`, `y`, `from`, `to`, `priceClassification`, `landTypeCode`
  - 期間形式: YYYYN (例: 20223 = 2022年第3四半期)
  - 戻り値: GeoJSON形式で不動産取引データの地点情報

- **XPT002**: 地価公示・地価調査のポイント（点）API
  - パラメータ: `response_format`, `z`, `x`, `y`, `year`, `priceClassification`, `useCategoryCode`
  - 戻り値: GeoJSON形式で地価公示データの地点情報

共通のポイントAPIパラメータ：
- `response_format`: GeoJSONまたはベクタータイル (geojson/pbf)
- `z`, `x`, `y`: マップタイル座標 (ズームレベル11-15)
- タイル座標は地図サービスやオンライン変換ツールで取得可能

すべてのAPIは以下のベースURLを使用: `https://www.reinfolib.mlit.go.jp/ex-api/external/`

## 主要実装詳細

- ES2022にコンパイルされるTypeScriptでESモジュールを使用
- APIリクエストとツール呼び出しの適切なエラーハンドリングを実装
- すべての物件データをJSON形式のレスポンスで返却
- サーバー初期化時にAPIキーの存在を検証
- Reinfolib APIへのHTTPリクエストにaxiosを使用
- 現在XIT001、XIT002、XCT001、XPT001、XPT002エンドポイントを実装；他のAPIも同様のパターンで追加可能
- バリデーションは無効化されており、パラメータは直接APIに渡される