# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## コマンド

```bash
npm run dev              # 開発サーバー(TinaCMS watch + next dev、localhost:3000)
npm run build            # 本番ビルド(下記パイプライン参照)
npm run build:local      # TinaCMS ビルドのみ(.env.local を使用)
npm run build:images     # next-image-export-optimizer で WEBP を生成(out/ が必要)
npm run optimize:images  # 元画像の圧縮(例: npm run optimize:images -- posts/<slug>)
npm run lint             # ESLint (next lint)
```

`npm run build` の実際のパイプライン:
**TinaCMS build**(`NEXT_PUBLIC_TINA_CLIENT_ID` 未設定ならスキップ)→ **next build** → **setup-image-cache.mjs**(コミット済み WEBP をキャッシュ位置へ復元)→ **next-image-export-optimizer**(WEBP 生成)→ **generate-sitemap.mjs** → **ping-indexnow.mjs**(IndexNow へ URL 送信。ローカル検証では実行しないこと)

## アーキテクチャ

**Next.js 16 App Router + 静的エクスポート**。本番ビルドのみ `output: 'export'`(`next.config.ts`)。全ページ `generateStaticParams()` による静的生成で、サーバーレンダリングのルートは無い。デプロイ先は Cloudflare Pages。

### ルート一覧

| ルート | 内容 |
|---|---|
| `/` | ホーム(`HomePostTabs`、おすすめタブあり) |
| `/blog/[slug]` | 記事ページ(MDX レンダリング、JSON-LD、目次、関連記事) |
| `/reviews` | 記事一覧(`FilteredBlogList`) |
| `/gear` | 愛用ガジェット一覧 |
| `/tags/[tag]` | タグ別アーカイブ |
| `/about`, `/privacy-policy` | 固定ページ |
| `/portfolio` | ポートフォリオ(noindex) |
| `/dashboard` | ウィジェットダッシュボード(独立サブシステム) |
| `/tools/image-editor` | ブラウザ画像エディタ(noindex) |

`app/template.tsx` が framer-motion のページ遷移を提供。404 はターミナル風のインタラクティブページ。

### コンテンツパイプライン

コンテンツソースは **ローカル MDX のみ**(Notion 連携は削除済み)。

- **記事**: `content/posts/*.mdx` → `lib/mdx.ts` が gray-matter でパース。エントリポイントは `getAllPosts()` / `getPostBySlug(slug)` / `getPostSlugs()`。`getAllPosts()` は `published: false` と `listed: false` を除外し日付降順にソート
- **ギア**: `content/my-gear/*.mdx` → `lib/gear-data.ts` の `getAllGearItems()`

### MDX レンダリング

`app/blog/[slug]/page.tsx` がサーバーサイドで MDX をレンダリング(`next-mdx-remote/rsc` + rehype-slug + remark-gfm + remark-breaks)。カスタムコンポーネントのマッピングは `components/MDXComponents.tsx` — 記事内の見出し・コードブロック・リンク等の見た目を変えるにはこのファイルを編集する。

**記事本文で使えるカスタムコンポーネント(用途別):**

- **レビュー用**: `<Specs>`/`<SpecsItem>`(スペック表)、`<BuyLinks>`/`<BuyLink>`(購入リンクカード)、`<ReviewSummary>`/`<ReviewPoints>`/`<ReviewPoint>`(GOOD/気になる点)、`<FeaturePoint>`(POINTカード)、`<CouponBox>`
- **レイアウト**: `<ImageGrid>`(画像の多列グリッド)、`<Figure>`、`<Details>`(折りたたみ)、`<Video>`、`<CheckList>`/`<CheckItem>`、`<ImageModal>`(クリック拡大画像)
- **装飾**: `<Text color="..." bg="...">`(マーカー・文字色)

Markdown の画像 `![alt](src)` は自動的に `<ImageModal>`(クリック拡大 + 最適化 WEBP 配信)になる。alt 末尾のサイズヒントで表示幅を指定可能: `![説明|small]`(33%)、`|medium`(50%)、`|large`(75%)、`|40%`(任意)。

## 画像の運用ルール(重要)

静的エクスポートのため `next-image-export-optimizer` のカスタムローダーを使用(`next.config.ts`)。**素の `<img>` タグは最適化を素通りするので使わない** — `ExportedImage`(next-image-export-optimizer)か、MDX 内なら Markdown 画像記法を使う。

1. **元画像はコミット前に圧縮する**: `npm run optimize:images -- posts/<slug>`(長辺 2560px・quality 82 に再圧縮)。カメラ直出しの 7〜10MB の JPG をそのままコミットしない(リポジトリ肥大とビルド時間悪化の原因)
2. **WEBP キャッシュをコミットする**: 新しい画像を追加したらローカルで `npm run build`(または `next build` 後に `npm run build:images`)を実行し、生成された `public/images/**/nextImageExportOptimizer/*.WEBP` をコミットする。**これを怠ると CI が毎回全サイズの WEBP を再生成し、Cloudflare Pages のビルドが数分余計にかかる**(`scripts/setup-image-cache.mjs` がコミット済み WEBP を CI のキャッシュ位置に復元して再生成をスキップさせる仕組み)
3. 記事画像は `public/images/posts/<slug>/` に置き、`/images/posts/<slug>/...` で参照する

## 記事フロントマター

### 記事 (`content/posts/*.mdx`)

```yaml
---
title: ""
subtitle: ""          # 任意
excerpt: ""           # 一覧・OG メタ・JSON-LD の説明文に使用
date: "YYYY-MM-DD"
category: ""
tags: []
coverImage: "/images/posts/<slug>/cover.jpg"
recommended: false    # ホームの「おすすめ」タブに表示
published: false      # false = 全一覧から非表示(URL 直アクセスは可、noindex)。公開時のみ true
listed: true          # false = 公開(インデックス可)だが一覧に出さない
# ↓ レビュー記事のみ(構造化データを生成)
rating: 4.5           # 任意: Review JSON-LD(5点満点)
price: "6980"         # 任意: Offer JSON-LD(円、数字のみ)
faqs:                 # 任意: FAQPage JSON-LD
  - question: ""
    answer: ""
---
```

`rating` / `price` / `faqs` を設定すると `app/blog/[slug]/page.tsx` が Review / FAQPage の JSON-LD を出力する(BlogPosting と BreadcrumbList は常時出力)。レビュー記事では設定を推奨。

### ギア (`content/my-gear/*.mdx`)

```yaml
---
name: ""
category: ""          # Keyboard / Monitor / Camera など
image: "/images/Gear/filename.jpg"
manufacturer: ""
specs:
  "キー": "値"
link_official: ""
link_amazon: ""
link_rakuten: ""
published: true       # 省略時は true 扱い
---
```

## 記事執筆の要点(レビュー記事)

標準構成: 導入(購入経緯)→ `<BuyLinks>` → スペック(`<Specs>`)+ 特徴(`<FeaturePoint>` ×2〜3)→ 開封・外観(`<ImageGrid>`)→ 使用感 → まとめ(`<ReviewSummary>`: GOOD 3〜5点 / 気になる点 1〜3点)→ 総評。

公開前チェックリスト:
- [ ] slug が英数字・ハイフンのみ
- [ ] `excerpt` 記入(SNS シェア・SEO 用)
- [ ] `coverImage` 設定 + 画像圧縮済み + WEBP キャッシュコミット済み
- [ ] レビュー記事なら `rating`(+ 可能なら `price` / `faqs`)
- [ ] `date` を **main にマージ(公開)する日付**に更新する(執筆開始日のまま放置しない。日付がズレたまま公開すると再度差し替え・再pushが必要になる)
- [ ] `published: true` に変更

### 文章表現の注意点

- **太字の範囲を `「」`や `()`などの閉じ括弧で終わらせない**: CommonMark の強調記号の判定ルール上、閉じ側の `**` が閉じ括弧(`」`・`』`・`）`など)に直接隣接し、かつその直後が空白でも句読点でもない通常の文字だと、強調記号として認識されず `*` がそのまま表示されてしまう(例: `**ゲル状（半固体）**に置き換える` → 太字が無効化される)。`「」`だけでなく `()` でも同様に起こるので、太字にしたい語の直後に地の文が続く場合は、括弧を太字の外に出す(例: `**ゲル状**（半固体）に置き換える`)か、括弧ごと太字にせず地の文と区切りを空ける
- **`()` による補足説明を多用しない**: 文中に `()` の注釈を挟みすぎると読みにくくなる。本文に直接組み込むか、文を分けて説明する
- **画像の後に手動でスペーサーを入れない**: `<Figure>` や Markdown 画像記法(`![alt](src)`)は下に自動で余白が入るので、`&nbsp;` などの手動スペーサーは不要(入れると余白が二重になる)

## TinaCMS

`tina/config.ts` が CMS スキーマを定義。**post コレクションのみ**(gear は CMS 管理外で、MDX ファイルを直接編集する)。`tina/__generated__/` は自動生成なので手動編集しない。TinaCMS は `content/posts/*.mdx` に直接書き込む。

## Git ワークフロー

- **必ずブランチで作業する** — 記事や機能ごとに新しいブランチを作る。`main` に直接コミットしない
- **ブランチ命名**: 記事は `post/<slug>`(例: `post/minecraft-fabric-mod-guide`)、機能は `feat/<name>`、修正は `fix/<name>`
- **main への push は明示的な指示があった時のみ** — フィーチャーブランチへのコミット・push は自由

## 規約

- **パスエイリアス**: `@/` はリポジトリルート**と** `./src/` の両方に解決される(`tsconfig.json`)
- **`src/` = LiftKit**: `@chainlift/liftkit` の golden-ratio ベース CSS デザインシステム。`app/globals.css` が import しており、`lk-*` 系のスペーシング/radius トークンを提供。`npm run add` で LiftKit コンポーネントを追加
- **スタイリング**: Tailwind v4。テーマカラー(`--primary`, `--accent`, `--background` など)は `app/globals.css` の CSS カスタムプロパティで定義(tailwind.config.js ではない)。ダークモードは `prefers-color-scheme`
- **日本語の改行**: 自然な折り返しが必要な箇所は `<BudouxText>` を使う
- **cn() ヘルパー**: `lib/utils.ts` の `cn()`(clsx + tailwind-merge)を条件付き className に使う

## 環境変数

```
NEXT_PUBLIC_SITE_URL          # サイトのベース URL(OG メタ・sitemap・IndexNow)
NEXT_PUBLIC_TINA_CLIENT_ID    # TinaCMS(未設定ならビルドで TinaCMS をスキップ)
TINA_TOKEN
NEXT_PUBLIC_SUPABASE_URL      # 任意: 閲覧数カウンター(ViewCounter)
NEXT_PUBLIC_SUPABASE_ANON_KEY
GITHUB_BRANCH / CF_PAGES_BRANCH  # TinaCMS のブランチ解決(CI が自動設定)
```

`lib/utils.ts` の `getBaseUrl()` は `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `https://xyzack271.com`(ハードコードのフォールバック)の順で解決する。

## 周辺サブシステム(記事作業では触らない)

- **ダッシュボード** (`app/dashboard/`, `components/dashboard/`, `lib/dashboard/`): zustand + react-grid-layout のウィジェットボード。ブログ本体とは独立
- **画像エディタ** (`app/tools/image-editor/`, `components/ImageEditor.tsx`): ブラウザ内の透かし・編集ツール
- **アナリティクス/広告**: `GoogleAnalytics` / `GoogleAdsense` コンポーネント(AdSense クライアント ID は `app/layout.tsx` にハードコード)、Supabase バックエンドの `ViewCounter`
