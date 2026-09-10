# 閲覧数カウンター(D1)のセットアップ手順

記事ページの閲覧数は Cloudflare Pages Functions(`functions/api/views/[slug].ts`)と D1 で数えている。設計は [spec-view-counter-d1.md](spec-view-counter-d1.md) を参照。

コードをデプロイしただけでは動かない。Cloudflare のダッシュボードで以下の設定が一度だけ必要。設定が済むまで、記事ページの閲覧数は表示されない(API が `503` を返し、クライアントはカウンターを非表示にする)。

## 1. D1 データベースを作る

1. Cloudflare ダッシュボード → **Storage & Databases** → **D1 SQL Database** → **Create**
2. データベース名は任意(例: `blog-views`)。リージョンは自動のままでよい

## 2. テーブルを作る

作成したデータベースの **Console** タブで次の SQL を実行する。

```sql
CREATE TABLE IF NOT EXISTS views (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
```

## 3. Pages プロジェクトにバインドする

1. **Workers & Pages** → このブログの Pages プロジェクト → **Settings** → **Bindings** → **Add** → **D1 database bindings**
2. **Variable name** は `DB`(大文字。コードが `context.env.DB` で参照している)
3. **D1 database** に手順1で作ったデータベースを選ぶ
4. **Production と Preview の両方**に設定する(Preview に設定が無いと、PR のプレビュー環境ではカウンターが表示されない)

## 4. 再デプロイする

バインドは再デプロイ後に有効になる。**Deployments** から最新のデプロイを **Retry deployment** するか、main に何かマージされたタイミングで反映される。

## 動作確認

記事ページを開き、ブラウザの開発者ツールの Network タブで次を確認する。

- 初回: `POST /api/views/<slug>` が `200` を返し、レスポンスが `{"count":1}` のような形になっている
- リロード: 同じタブでは `GET` に切り替わり、数値は増えない
- 別のタブをシークレットウィンドウで開く: 数値が1増える

`503 {"error":"db not configured"}` が返る場合は、バインド名が `DB` になっていないか、再デプロイがまだ済んでいない。

## 数値を直接見る・直す

D1 の Console で SQL を実行する。

```sql
SELECT slug, count FROM views ORDER BY count DESC;
UPDATE views SET count = 0 WHERE slug = 'example-slug';
```

## 無料枠

- Pages Functions の起動は Workers と合わせて1日10万リクエストまで。`public/_routes.json` で `/api/*` だけを Functions に回しているので、記事ページの表示そのものは枠を消費しない
- D1 の無料枠の書き込みは1日10万行。閲覧1回で1行を更新する
