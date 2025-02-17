# Hono App

 Hono を使用した 食品栄養価API

## 概要

このプロジェクトは Hono フレームワークを使用して構築された 食品栄養価APIです。

## 必要条件

- Node.js (v16 以上)
- npm

## セットアップ

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd hono-app
```

2. 依存関係のインストール:
```bash
npm install
```

## 開発方法

開発サーバーを起動:
```bash
npm run dev
```
アプリケーションは http://localhost:8787 で実行されます。

## デプロイ

プロジェクトをデプロイ:
```bash
npm run deploy
```

## 技術スタック

- [Hono](https://hono.dev/)
- TypeScript
- Cloudflare Workers
- [日本食品標準成分表（八訂）増補2023年](https://www.mext.go.jp/a_menu/syokuhinseibun/mext_00001.html)

## ライセンス

MIT
