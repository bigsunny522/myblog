# 記事閲覧数カウンター(ViewCounter)のセットアップ・トラブルシューティング

`components/ViewCounter.tsx` は Supabase をバックエンドに記事ごとの閲覧数を保存・表示する。仕組み上、以下のいずれかが欠けているだけで「機能していないように見える」状態になる。

## 仕組み

1. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が両方設定されていれば実データモード、片方でも欠けていれば**デモモード**(slug から生成した架空の数字を表示し、1.5秒後に+1する演出)で動作する(`lib/supabaseClient.ts` の `isSupabaseConfigured`)。
2. 実データモードでは、記事ページ初回表示時に `sessionStorage` の `viewed_<slug>` フラグを見て未読なら Supabase の `increment(slug_text)` RPC を呼び、既読ならテーブルを `select` するだけ。

## よくある症状と原因

| 症状 | 原因の可能性 |
|---|---|
| 本物ではなさそうな数字が出る/わずかに勝手に増える | **デモモードが本番で動いている** = Cloudflare Pages の Production 環境変数に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されていない(Preview 環境にしか設定していない、は特によくある事故) |
| 常に 0 のまま/ほとんど増えない | `views` テーブルや `increment` 関数が Supabase 側に存在しない、または RLS ポリシーで anon から拒否されている |
| ブラウザのコンソールにエラーが出る | RPC/SELECT の失敗理由がそのままログに出る(2026-08 の改修でエラーを握りつぶさないようにした) |

## 確認手順

1. **ブラウザの開発者ツール(コンソール)で確認する** — 本番サイトの記事ページを開き、コンソールに `[ViewCounter]` から始まる警告・エラーが出ていないか見る。
   - `Supabase が未設定のためデモモードで動作中` と出ていれば → 環境変数の設定漏れ(下記2へ)。
   - `increment RPC に失敗しました` / `views テーブルの取得に失敗しました` と出ていれば → Supabase 側のスキーマ/RLS の問題(下記3へ)。
2. **Cloudflare Pages の環境変数を確認する** — プロジェクトの Settings → Environment variables で、`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が **Production** 環境(Preview だけでなく)に設定されているか確認する。設定後は再デプロイが必要。
3. **Supabase 側のスキーマを確認・再適用する** — `supabase/schema.sql` を Supabase ダッシュボードの SQL Editor にそのまま貼り付けて実行する(冪等なので何度実行しても安全)。`views` テーブルと `increment` 関数、および anon ロールへの権限付与を一括で用意する。

## 既知の制約(バグではなく仕様)

- カウント抑制は `sessionStorage` ベースのため、タブを閉じて開き直す・別ブラウザ・シークレットモードなどでは再カウントされる。またクローラーや SNS のリンクプレビュー bot のアクセスも区別せずカウントする。ユニーク訪問者数ではなく簡易的なページビュー数として扱うこと。
