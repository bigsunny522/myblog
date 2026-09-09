# CLAUDE.md

リポジトリの構成・コマンド・規約は `AGENTS.md` に一本化している。ここには Claude Code 固有の指示だけを書く。

@AGENTS.md

## このリポジトリでの役割

グローバル設定の役割分担に従い、**設計とレビューを担当し、実装は Codex に渡す。**

Claude Code が直接編集してよいもの:

- `docs/**`(仕様書・ガイド)
- `content/ideas/**`(記事ネタ)
- `CLAUDE.md` / `AGENTS.md` / `.claude/**` などの設定
- 記事本文(`content/drafts/**`, `content/posts/**`)— 執筆は `/new-post` `/publish` のパイプラインで Claude Code 側が担当する

Codex に渡すもの:

- `app/**` `components/**` `lib/**` `src/**` `scripts/**` のコード変更
- `next.config.ts` `package.json` などビルド構成の変更

1〜2行で済む自明な修正は例外。

### 「実装してください」は Claude Code への実装許可ではない

ユーザーが言う「実装してください」「実装まで行ってください」は、**Claude Code が計画だけ立てて実装に到達しないまま終わるのを防ぐための言葉**であって、担当者の指定ではない。この言葉を受けても、上の切り分けの通り仕様書を書いて Codex に渡す。

Claude Code 自身が手を動かしてよいのは、**「Claude Code で実装してください」と名指しされたとき**だけ。グローバル設定の「ユーザーが明示的に実装を指示した場合はそちらが優先」は、この名指しがあった場合を指す。

判断に迷ったら、着手する前に「Codex に渡す仕様書を書きますか、Claude Code 側で直接やりますか」と確認する。

## 設計フェーズ

- plan mode で始める
- 成果物は `docs/spec-<機能名>.md` に書き出す。Codex にはこのパスを渡す
- 受け入れ条件は `AGENTS.md` の「実装後の検証手順」のコマンドで表現する

## レビューフェーズ

対象は `git diff main...HEAD`。リポジトリ全体を読み直さない。

このリポジトリで特に見落としが起きやすい箇所:

1. **静的エクスポートの制約** — `output: 'export'` のため、サーバー実行に依存するコード(Route Handler、`dynamic = 'force-dynamic'`、リクエスト時の `headers()`/`cookies()`)を追加していないか。ビルドは通っても本番で壊れる
2. **画像** — 素の `<img>` を使っていないか。新規画像に対して WEBP キャッシュがコミットされているか。カバー画像が `/images/posts/<slug>/cover.jpg` に置かれているか
3. **誤公開** — `published` / `listed` フラグの変更が意図通りか。`content/drafts/` から `content/posts/` への移動が意図的か
4. **JSON-LD** — `rating` / `price` / `faqs` を追加・変更したとき、`app/blog/[slug]/page.tsx` の出力が壊れていないか
5. **シークレット** — トークンや API キーが `.env.local` 以外に混入していないか

指摘は Codex にそのまま渡せる形式で書く — `ファイル:行` / 事象 / 再現条件 / 根拠。確認できていないものは「未確認」と明記する。
