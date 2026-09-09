# spec: サイトの小規模修正(文言・メタ・canonical・sitemap)

> 作成: 2026-09-08 / 設計: Claude Code / 実装: Codex
> 元プラン: `docs/superpowers/plans/2026-09-08-site-improvements.md`(Phase A〜C)
> 本スペックはそのうち **Task 2 / 3 / 4 と Task 1 の一部** に絞った縮小版。

## 1. 背景

公開中のサイトに以下が出ている。いずれもコードだけで完結し、判断待ちが無い。

| 事象 | 根拠(ファイル:行) |
|---|---|
| `/reviews` に開発中の文言 `Testing displaying N matches` が出ている | `components/FilteredBlogList.tsx:53` |
| 同ページの空状態が英語 `No articles found with this tag.` | `components/FilteredBlogList.tsx:71` |
| `<meta name="description">` / OG / Twitter が英語の汎用文 | `app/layout.tsx:17,20,37` / `app/page.tsx:11,20` |
| `/about` `/gear` のメタ説明が英語 | `app/about/page.tsx:15,17,25` / `app/gear/page.tsx:15,17,25` |
| タグページのメタが英語 | `app/tags/[tag]/page.tsx:21-35` |
| `excerpt` 未記入記事のフォールバック説明が英語 | `app/blog/[slug]/page.tsx:65` |
| `alternates.canonical` がどのページにも無い | `app/` `lib/` 全体で該当0件 |
| sitemap に実体の無い `/gear/<slug>` が3件載っている | `scripts/generate-sitemap.mjs:78`(`app/gear/[slug]` ルートは存在しない) |

## 2. 変更対象

### 2-1. 英語プレースホルダーの日本語化

**`components/FilteredBlogList.tsx`**

51-53行:

```tsx
      {/* Results Count */}
      <div className="text-center text-muted-foreground text-sm">
        Testing displaying {filteredPosts.length} matches
      </div>
```

↓

```tsx
      {/* Results Count */}
      <div className="text-center text-muted-foreground text-sm">
        {selectedTag ? `#${selectedTag} の記事 ${filteredPosts.length} 件` : `全 ${filteredPosts.length} 件`}
      </div>
```

69-73行の `No articles found with this tag.` → `このタグの記事はまだありません。`

### 2-2. メタ説明の日本語化

サイト共通の説明文は `docs/blog-growth-roadmap.md` のトップ説明文案をそのまま使う:

```
デスクも、持ち歩きも、使い心地で選ぶ。ガジェットの実体験と、AI・プログラミングで日常を快適にする工夫を紹介します。
```

| ファイル | 置換前 | 置換後 |
|---|---|---|
| `app/layout.tsx`(3箇所) | `The best gadget reviews and tech news.` | 上記の共通説明文 |
| `app/page.tsx`(2箇所) | `The best gadget reviews and tech news.` | 上記の共通説明文 |
| `app/about/page.tsx`(3箇所) | `About Zack Lab and the operator.` | `ざっくらぼと運営者について。レビューの方針と運営者のプロフィールを紹介しています。` |
| `app/gear/page.tsx`(3箇所) | `Zack's curated list of gadgets and desk setup gear.` | `運営者が実際に使っているガジェットとデスク環境の一覧です。` |
| `app/blog/[slug]/page.tsx:65` | `Read more about ${post.title}`(テンプレートリテラル) | `${post.title} のレビュー・解説記事です。`(テンプレートリテラル) |

共通説明文は2ファイル5箇所に同じ文字列を書くことになるが、**定数化しない**。抽象化するほどの数ではない。

**`app/tags/[tag]/page.tsx`** の `generateMetadata` の `return`(`siteImage` の行は既存のまま残す):

```tsx
  return {
    title: `#${decodedTag} の記事`,
    description: `「${decodedTag}」に関する記事の一覧です。`,
    alternates: { canonical: `/tags/${tag}` },
    openGraph: {
      title: `#${decodedTag} の記事 | ざっくらぼ`,
      description: `「${decodedTag}」に関する記事の一覧です。`,
      url: `/tags/${tag}`,
      siteName: 'ざっくらぼ',
      type: 'website',
      images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${decodedTag} の記事 | ざっくらぼ`,
      description: `「${decodedTag}」に関する記事の一覧です。`,
      images: [siteImage],
    },
  };
```

### 2-3. canonical URL の出力

**方式: `metadataBase` 依存の相対パス。ヘルパーファイルは作らない。**

`app/layout.tsx:12` で `metadataBase: new URL(getBaseUrl())` が既に設定済み。Next.js は `alternates.canonical` の相対パスを `metadataBase` で解決して絶対URLを出力するため、各ページに1行足すだけでよい。元プラン(Task 4)は `lib/metadata.ts` に `canonicalOf()` を新設する案だったが、新規ファイル・新規抽象が不要なこちらを採る。

各ファイルの `metadata` オブジェクト(または `generateMetadata` の戻り値)に1行追加する:

| ファイル | 追加する行 |
|---|---|
| `app/page.tsx` | `alternates: { canonical: '/' },` |
| `app/reviews/page.tsx` | `alternates: { canonical: '/reviews' },` |
| `app/about/page.tsx` | `alternates: { canonical: '/about' },` |
| `app/gear/page.tsx` | `alternates: { canonical: '/gear' },` |
| `app/contact/page.tsx` | `alternates: { canonical: '/contact' },` |
| `app/privacy-policy/page.tsx` | `alternates: { canonical: '/privacy-policy' },` |
| `app/tags/[tag]/page.tsx` | 2-2 の差し替えに含む。`tag`(エンコード済み)をそのまま使い、`decodedTag` は使わない |
| `app/blog/[slug]/page.tsx` | `` alternates: { canonical: `/blog/${slug}` }, `` |

- `app/layout.tsx` には `alternates` を**足さない**。ルートレイアウトに書くと全ページが同じ canonical を継承する
- `app/portfolio/page.tsx` と `app/tools/image-editor/page.tsx` は noindex。**触らない**

### 2-4. sitemap から gear 個別 URL を落とす

`app/gear/[slug]` ルートが存在せず、gear 個別ページはどこからもリンクされていない。`/gear` 一覧は既に sitemap にあるため、個別 URL を落とす。

**`scripts/generate-sitemap.mjs`** から次の3箇所を削除する:

1. 49-56行の `// Gear items` 〜 `const gearSlugs = ...` ブロック全体
2. 77-82行の `...gearSlugs.map((slug) => ...)` の配列要素
3. 96行の `console.log` から `${gearSlugs.length} gear + ` の部分(残る数式が `staticPages.length` + `slugs.length` = `urlEntries.length` で辻褄が合うようにする)

`getPublished()` は記事側でも使っているので**削除しない**。

### 2-5. 触らないファイル

- `app/sitemap.ts` — 実質デッドコードだが今回は残す(受け入れ条件にも含めない)
- `app/portfolio/page.tsx`, `app/tools/image-editor/page.tsx` — noindex
- `content/**` — 記事本文の変更は無し
- `public/images/**` — 画像パスの変更が無いため WEBP キャッシュの再生成も不要

## 3. 受け入れ条件

### 3-1. 静的チェック

```bash
npm run lint
npx tsc --noEmit
```

どちらもエラー0で終了すること。

### 3-2. 検証ビルド

**`npm run build` を使わないこと。** 末尾で `scripts/ping-indexnow.mjs` が走り、検索エンジンに実URLを通知してしまう。次を Bash(Git Bash)で実行する:

```bash
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs
```

エラーなく完了すること。

### 3-3. ビルド成果物への assertion

`grep -c` は該当なしのとき `0` を出力して exit 1 になる。`&&` で連結せず1行ずつ実行すること。

```bash
# (a) 英語プレースホルダーが消えている
grep -c "Testing displaying\|No articles found" out/reviews.html
grep -c "The best gadget reviews" out/index.html
grep -c "About Zack Lab" out/about.html
grep -c "curated list of gadgets" out/gear.html
grep -rl "Posts tagged with\|Articles tagged with" out/tags/

# (b) 日本語の共通説明文が入っている
grep -o "デスクも、持ち歩きも、使い心地で選ぶ" out/index.html | head -1

# (c) canonical が各ページに1件ずつ、自分自身の絶対URLで出ている
for f in out/index.html out/reviews.html out/about.html out/gear.html out/contact.html out/privacy-policy.html; do
  echo "--- $f"; grep -o 'rel="canonical" href="[^"]*"' "$f"
done
ls out/blog/*.html | head -1 | xargs grep -o 'rel="canonical" href="[^"]*"'

# (d) noindex ページに canonical が付いていない
grep -c 'rel="canonical"' out/portfolio.html

# (e) sitemap に gear 個別URLが無い
grep -c "<loc>[^<]*/gear/[^<]" out/sitemap.xml

# (f) sitemap の /gear 一覧と記事URLは残っている
grep -c "<loc>[^<]*/gear</loc>" out/sitemap.xml
grep -c "<loc>[^<]*/blog/" out/sitemap.xml
```

期待値:

- (a) 4つの `grep -c` がすべて `0`。`grep -rl` は**何も出力しない**
- (b) `デスクも、持ち歩きも、使い心地で選ぶ` が出力される
- (c) 各ファイル1件ずつ、`https://xyzack271.com/` `https://xyzack271.com/reviews` のように**自分自身の**絶対URLが出る。0件のファイルがあれば `alternates` の足し忘れ
- (d) `0`
- (e) `0`
- (f) どちらも1以上

### 3-4. ブラウザでの目視確認

dev サーバーで `/reviews` を開き:

1. 初期表示が `全 N 件` で、`N` が published な記事数と一致する
2. タグを1つ選ぶと `#<タグ名> の記事 N 件` に変わり、下の記事カード枚数と一致する
3. `All` に戻すと初期表示に戻る
4. コンソールにエラーが出ていない

## 4. 対象外

今回やらないこと。着手しないこと。

| 項目 | 理由 |
|---|---|
| `app/sitemap.ts` の削除 | デッドコードだが実害が無い。生成元の一本化は回帰防止スクリプトとセットで別タスクにする |
| `scripts/check-sitemap.mjs` の新規作成と CI ステップ追加(元プラン Task 1 の残り) | 新規スクリプト+ワークフロー変更を伴う。「大きな変更を伴わない」の枠外 |
| `app/gear/[slug]` ルートの新設 | ページに何を出すかが編集判断 |
| 元プラン Task 5(`updated` フィールド導入) | フロントマター・型・JSON-LD・sitemap・検品まで波及する |
| 元プラン Task 6(オープニング演出の3秒待機) | 見た目の挙動変更 |
| タグ・カテゴリの整理 | 編集判断が必要(元プラン末尾「含めなかった項目」参照) |

## 5. 想定される落とし穴

1. **`metadataBase` への依存** — canonical を相対パスで書く方式は `app/layout.tsx` の `metadataBase` が効いていることが前提。ビルド成果物の canonical が相対パスのまま出ていたら方式が効いていないので、その場合のみ `getBaseUrl()` で絶対URLを組む方式に切り替える。3-3(c) で必ず確認すること
2. **`app/layout.tsx` に `alternates` を書かない** — 書くと全ページが同じ canonical を継承し、重複コンテンツ扱いを招く
3. **タグページの canonical はエンコード済みの `tag` を使う** — `decodedTag` を使うと日本語タグでURLが壊れる
4. **`npm run build` を通しで実行しない** — 末尾の IndexNow ping が検索エンジンに実URLを通知する。検証は 3-2 のコマンド列を使う
5. **`app/blog/[slug]/page.tsx:59` の `Post Not Found` は英語のまま残る** — `getPostBySlug` が null を返す経路は静的エクスポートでは到達しない。今回は触らない
6. **`app/contact/page.tsx` と `app/privacy-policy/page.tsx` の説明文は既に日本語** — 2-2 の対象外。canonical の1行だけ足す
7. **画像パスは変更しないので WEBP キャッシュの再生成は不要** — `public/images/**/nextImageExportOptimizer/*.WEBP` に差分が出たらパスを触っている可能性があるので確認する

## 6. コミット単位

4コミットに分ける。いずれも末尾に `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` を付ける。

1. `fix: 記事一覧の件数表示と空状態を日本語にする`(2-1)
2. `fix: メタ説明を英語の汎用文から日本語に差し替える`(2-2)
3. `feat: 全インデックス対象ページに canonical URL を出力する`(2-3)
4. `fix: sitemap から実体の無い gear 個別URLを除去する`(2-4)

ブランチは現在の `feat/blog-editorial-roadmap` をそのまま使う。`main` へ直接コミット・push しない。
