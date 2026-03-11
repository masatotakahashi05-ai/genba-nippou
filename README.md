# 現場日報アプリ

建設現場向けのQRコード日報管理アプリです。

## Vercelへのデプロイ手順

### 方法①：GitHubを使う方法（推奨）

1. [github.com](https://github.com) でリポジトリを作成
2. このフォルダの中身をすべてアップロード
3. [vercel.com](https://vercel.com) にログイン
4. 「Add New Project」→ GitHubのリポジトリを選択
5. そのまま「Deploy」ボタンを押す
6. URLが発行されたら完成！

### 方法②：Vercel CLIを使う方法

```bash
npm install -g vercel
cd genba-nippou
vercel
```

## QRコードの作り方（運用時）

発行されたURLに以下のパラメータを追加してQRコードを作成：

```
https://あなたのURL/?site=S001&company=C001
```

| パラメータ | 意味 |
|-----------|------|
| site | 現場ID |
| company | 会社ID |

QRコード生成サイト例：https://qr.quel.jp/

## 機能

- QRコードスキャンで現場・会社を自動判別
- 作業員の氏名・作業内容・備考の記録
- 入場・退場時刻の自動記録
- 管理者ダッシュボード（現場・会社でフィルタ）
