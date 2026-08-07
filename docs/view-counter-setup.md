# 記事閲覧数カウンター(ViewCounter)のセットアップ・トラブルシューティング

`components/ViewCounter.tsx` は同一オリジンの `/api/views/:slug`(Cloudflare Pages Function)を叩いて記事ごとの閲覧数を取得・加算する。バックエンドは Cloudflare D1(SQLite)。

以前は Supabase を使っていたが、無料プランは API アクセスが約1週間ないとプロジェクトが自動的に一時停止する仕様があり、アクセス数の少ない個人ブログでは実際にカウンターが止まってしまう問題があった。D1 はアクセス頻度による自動停止がなく、デプロイ先の Cloudflare Pages と同一プラットフォームで完結するため、2026-08 に移行した。

## 仕組み

1. `functions/api/views/[slug].ts` が Cloudflare Pages Function として `/api/views/:slug` に生える(`output: 'export'` の静的ビルドとは独立して Cloudflare Pages がデプロイ時に自動検出する)。
2. `GET` は現在のカウントを返すだけ、`POST` は D1 の `views` テーブルに upsert して +1 し、更新後のカウントを返す。
3. `ViewCounter.tsx` は `sessionStorage` の `viewed_<slug>` フラグを見て、未読ならタブごとに一度だけ `POST`(加算)、既読なら `GET`(表示のみ)する。

## 初回セットアップ(Cloudflare ダッシュボード)

1. **D1 データベースを作成する** — Cloudflare ダッシュボード → Workers & Pages → D1 → 「データベースを作成」。名前は任意(例: `myblog-views`)。
2. **マイグレーションを適用する** — 作成した D1 データベースの「Console」タブを開き、`migrations/0001_init_views.sql` の内容をそのまま貼り付けて実行する(冪等なので何度実行しても安全)。
3. **Pages プロジェクトにバインドする** — 対象の Pages プロジェクト → Settings → Functions → 「D1 database bindings」で、変数名 `DB` として手順1で作ったデータベースを紐付ける。**Production と Preview の両方**に設定すること(片方だけ設定して本番だけ動かない、という事故が起きやすい)。
4. 設定後、再デプロイ(または次回のデプロイ)から反映される。

## よくある症状と原因

| 症状 | 原因の可能性 |
|---|---|
| 常に 0 のまま/増えない | D1 バインディング(`DB`)が Pages プロジェクトに設定されていない、または Production 環境にだけ設定漏れがある |
| ブラウザのコンソールに `/api/views/... が 500 を返しました` 等のエラーが出る | マイグレーション未適用で `views` テーブルが存在しない、または D1 のクエリ自体が失敗している |
| ローカル開発(`npm run dev`)で常に 0 | 想定内の挙動。`functions/` は Cloudflare Pages 上でのみ動作し、`next dev` では配信されないため `/api/views/*` は 404 になる |

## 確認手順

1. **ブラウザの開発者ツール(コンソール)で確認する** — 本番サイトの記事ページを開き、`[ViewCounter]` から始まるエラーが出ていないか見る。HTTP ステータスと合わせて上記の表と照らし合わせる。
2. **`/api/views/<slug>` に直接アクセスしてみる** — 本番ドメインで `https://<本番ドメイン>/api/views/<任意のslug>` を開き、`{"count":0}` のような JSON が返れば D1 側は正常に繋がっている。500 番台やエラーページが返る場合は手順1〜3(バインディング・マイグレーション)を再確認する。
3. **Cloudflare ダッシュボードで D1 の中身を直接見る** — D1 データベースの Console タブで `SELECT * FROM views;` を実行すれば、実際にカウントが増えているか確認できる。

## 既知の制約(バグではなく仕様)

- カウント抑制は `sessionStorage` ベースのため、タブを閉じて開き直す・別ブラウザ・シークレットモードなどでは再カウントされる。またクローラーや SNS のリンクプレビュー bot のアクセスも区別せずカウントする。ユニーク訪問者数ではなく簡易的なページビュー数として扱うこと。
