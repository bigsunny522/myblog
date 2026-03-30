# Notion連携セットアップ手順

## 1. Notion Integrationを作成する

1. https://www.notion.so/my-integrations を開く
2. 「New integration」をクリック
3. 名前を入力（例: `my-terminal-blog`）、ワークスペースを選択
4. 「Submit」で作成
5. 表示される **Internal Integration Token**（`secret_xxx...`）をコピーしておく

## 2. Notionにデータベースを作成する

新しいページにデータベース（テーブル形式）を作成し、以下のプロパティを追加する。

| プロパティ名 | 種類 | 説明 |
|---|---|---|
| `Title` | タイトル（デフォルト） | 記事タイトル |
| `Slug` | テキスト | URLスラッグ（例: `my-first-post`） |
| `Subtitle` | テキスト | サブタイトル（任意） |
| `Excerpt` | テキスト | 記事の概要（一覧ページに表示） |
| `Date` | 日付 | 公開日 |
| `Category` | セレクト | カテゴリ（例: レビュー、Tech） |
| `Tags` | マルチセレクト | タグ |
| `Recommended` | チェックボックス | おすすめ記事フラグ |
| `Published` | チェックボックス | 公開フラグ（チェックで公開） |

**カバー画像**はNotionページの「カバーを追加」機能で設定する（プロパティ不要）。

## 3. IntegrationをデータベースにConnectする

1. 作成したデータベースページを開く
2. 右上の「...」→「Connect to」→ 作成したIntegrationを選択
3. 「Confirm」で接続

## 4. Database IDを取得する

データベースページのURLを確認する：

```
https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyyyyyy
```

`?` より前の32文字（ハイフンなし）が **Database ID**。

## 5. 環境変数を設定する

### ローカル開発

`.env.local.example` を `.env.local` にコピーして値を入力：

```bash
cp .env.local.example .env.local
```

```
NOTION_API_KEY=secret_xxx...
NOTION_DATABASE_ID=xxxxxxxx...
```

### Cloudflare Pagesの環境変数

Cloudflare Dashboardで設定：

1. Workers & Pages → プロジェクトを選択
2. Settings → Environment variables
3. `NOTION_API_KEY` と `NOTION_DATABASE_ID` を追加（Production & Preview両方）

## 6. 記事を書く

1. Notionデータベースに新しいページを追加
2. 各プロパティを入力（SlugとDateは必須）
3. `Published` をチェック
4. ページ本文に記事を書く（Markdown形式でレンダリングされる）
5. GitHubにPushするか、Cloudflare PagesのDeploy Hookを叩いてビルドをトリガー

## 注意事項

- ビルド時に画像が `public/images/notion/` へ自動ダウンロードされる
- ダウンロード済み画像はキャッシュされる（再ダウンロードされない）
- Notion側で画像を差し替えた場合は `public/images/notion/` の該当ファイルを削除してから再ビルド
- `NOTION_API_KEY` が未設定の場合は従来の MDX ファイルでの動作にフォールバックする
