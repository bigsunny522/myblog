# ざっくらぼ サイト改善 実装プラン(Phase A〜C)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/blog-growth-roadmap.md`(Codex の調査)で挙がった指摘のうち、**コードだけで完結し判断待ちのない項目**を、回帰防止の機械検品つきで修正する。

**Architecture:** 既存の「機械検品(`npm run check:posts`)+ CI(`.github/workflows/validate.yml`)」の枠組みに乗せる。新しい不変条件は文章の申し送りではなくスクリプトで固定し、CI で落ちるようにする。UI 修正は Next.js App Router の既存パターン(`export const metadata` / `generateMetadata`)に従い、新しい抽象は作らない。

**Tech Stack:** Next.js 16 App Router(静的エクスポート)/ TypeScript / Tailwind v4 / framer-motion / Node スクリプト(ESM `.mjs`)

## Global Constraints

- 必ずフィーチャーブランチで作業する。ブランチ名は修正なら `fix/<name>`、機能追加なら `feat/<name>`。`main` へ直接コミット・push しない(CLAUDE.md「Git ワークフロー」)
- **ローカル検証で `npm run build` を丸ごと実行しない。** 末尾で `scripts/ping-indexnow.mjs` が走り、検索エンジンへ実 URL を通知してしまう。検証は CI と同じ個別ステップを使う:
  ```bash
  npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs
  ```
  以降この一連を **「検証ビルド」** と呼ぶ。`&&` チェーンを使うので PowerShell ではなく Bash(Git Bash)で実行する
- このリポジトリに**単体テストランナーは無い**(package.json に vitest / jest / playwright いずれも無し)。したがって本プランの「テスト」は次の3種類:
  1. Node スクリプトによるビルド成果物(`out/`)への assertion — 新規作成し CI に載せる
  2. `npm run check:posts`(既存の記事検品)
  3. Browser pane による目視・DOM 確認
- `tina/__generated__/` は自動生成。手動編集しない
- 画像パスを変更した場合は WEBP キャッシュを再生成してコミットする(CLAUDE.md「画像の運用ルール」)
- コミットメッセージ末尾に `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` を付ける

---

## 事前確認で判明した事実(2026-09-08 時点)

Codex の指摘を実コードで裏取りした結果。プランはこの状態を前提にする。

| 指摘 | 確認結果 |
|---|---|
| sitemap の gear URL が 404 | **確認** `scripts/generate-sitemap.mjs:78` が `/gear/<slug>` を出力。`content/my-gear/` の `published: false` でない3件(`Lofreeflow2` / `Rainy75` / `fifineSC3`)が対象。`app/gear/` には `page.tsx` しか無く `[slug]` ルートが存在しない |
| sitemap の生成元が重複 | **確認** `app/sitemap.ts` と `scripts/generate-sitemap.mjs` の2系統。ビルド順が `next build` → `generate-sitemap.mjs` なので、`app/sitemap.ts` の出力は後者に上書きされ**実質デッドコード** |
| `Testing displaying 8 matches` | **確認** `components/FilteredBlogList.tsx:53`。同ファイル `:71` にも `No articles found with this tag.` という英語文言あり |
| ルートメタ説明が英語の汎用文 | **確認** `app/layout.tsx:17,20,37` と `app/page.tsx:11,20` が `The best gadget reviews and tech news.`。`app/tags/[tag]/page.tsx:21-35` も `Posts tagged with #...` / `Articles tagged with #...` と英語 |
| canonical 無し | **確認** `app/` `lib/` 配下に `alternates` / `canonical` の記述が1件も無い |
| `dateModified` が `post.date` 固定 | **確認** `app/blog/[slug]/page.tsx:149` |
| オープニング演出が閲覧を遮る | **一部訂正** `components/OpeningAnimation.tsx:42` の3秒待機は事実だが、`OpeningAnimation` は `app/page.tsx:41` の**ホームでのみ**使われている。記事ページ(検索流入の着地点)は遮られていない。影響範囲はホーム初回訪問のみ |
| タグが34件・うち28件が1記事 | 未再計測。本プランの範囲外(末尾の「含めなかった項目」参照) |

---

## File Structure

**新規作成**

- `scripts/check-sitemap.mjs` — `out/sitemap.xml` の全 `<loc>` に対応する HTML が `out/` に存在するか検証する。単一責務: サイトマップと実出力の整合のみ
- `lib/metadata.ts` — canonical URL を組み立てる小さなヘルパー。各ページの `metadata` から呼ぶ。単一責務: パス → `alternates.canonical` の生成のみ

**変更**

- `scripts/generate-sitemap.mjs` — gear 個別 URL の出力を停止 / `lastmod` の更新日対応
- `app/sitemap.ts` — 削除(生成元を `scripts/generate-sitemap.mjs` に一本化)
- `.github/workflows/validate.yml` — 検証ビルド後に `check:sitemap` を追加
- `package.json` — `check:sitemap` スクリプトを追加
- `components/FilteredBlogList.tsx` — 件数表示と空状態の日本語化
- `app/layout.tsx` / `app/page.tsx` / `app/tags/[tag]/page.tsx` — 説明文の日本語化 + canonical
- `app/reviews/page.tsx` / `app/about/page.tsx` / `app/gear/page.tsx` / `app/contact/page.tsx` / `app/privacy-policy/page.tsx` / `app/blog/[slug]/page.tsx` — canonical
- `lib/mdx.ts` / `tina/config.ts` / `scripts/validate-posts.mjs` / `CLAUDE.md` — `updated` フロントマターの導入
- `components/OpeningAnimation.tsx` — 非ブロッキング化

---

# Phase A: 明確なバグ(公開中のサイトに出ている実害)

## Task 1: sitemap に存在しない URL が含まれる問題を修正し、回帰を機械で防ぐ

**背景と設計判断:** `/gear/<slug>` の3 URL が sitemap に載っているが該当ルートが無く 404。取りうる選択肢は2つ。

- (a) sitemap から gear 個別 URL を落とす — **採用**。`/gear` 一覧ページは既に sitemap にあり、gear の個別ページは現状どこからもリンクされていない。存在しないページを消すのは可逆で、判断待ちが無い
- (b) `app/gear/[slug]/page.tsx` を新規作成する — 見送り。ページの中身(どんな情報を出すか)を決める必要があり、コードだけで完結しない。gear 個別ページが欲しくなった時点で別タスクにする

あわせて `app/sitemap.ts` を削除する。`npm run build` のパイプラインでは `next build` の出力を `generate-sitemap.mjs` が必ず上書きするため、`app/sitemap.ts` は動いていないのに「サイトマップの定義はここ」と読める。2系統あること自体が今回の 404 を見落とした原因なので、生成元を1つに固定する。

**Files:**
- Create: `scripts/check-sitemap.mjs`
- Modify: `scripts/generate-sitemap.mjs:49-56, 77-82, 97`
- Delete: `app/sitemap.ts`
- Modify: `package.json`(scripts に1行追加)
- Modify: `.github/workflows/validate.yml`(Build ステップの後に1ステップ追加)

**Interfaces:**
- Consumes: なし
- Produces: `npm run check:sitemap` — `out/sitemap.xml` の各 `<loc>` について、パスに対応する `out/<path>.html` または `out/<path>/index.html` が存在するか検証する。1件でも欠けたら該当 URL を列挙して exit 1。`out/sitemap.xml` が無ければ exit 1

- [ ] **Step 1: 失敗する検証スクリプトを書く**

`scripts/check-sitemap.mjs` を新規作成:

```js
/**
 * Post-build check: out/sitemap.xml の全URLが実際に出力されているか検証する。
 * 存在しないページをサイトマップに載せると検索エンジンに404を通知することになるため、
 * ビルド成果物に対して機械的に突き合わせる。
 *
 * Usage: node scripts/check-sitemap.mjs   (先に next build + generate-sitemap.mjs が必要)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../out');
const sitemapPath = path.join(outDir, 'sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  console.error('Error: out/sitemap.xml が見つかりません。先に検証ビルドを実行してください。');
  process.exit(1);
}

const xml = fs.readFileSync(sitemapPath, 'utf8');
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (locs.length === 0) {
  console.error('Error: out/sitemap.xml に <loc> が1件もありません。');
  process.exit(1);
}

// URL のパス部分を out/ 配下のファイルへ解決する。
// 静的エクスポートは trailingSlash 未設定なので "foo.html" 形式だが、
// 将来 trailingSlash を有効にした場合の "foo/index.html" も許容する。
function resolveOutFile(loc) {
  const pathname = decodeURIComponent(new URL(loc).pathname).replace(/\/$/, '');
  if (pathname === '') return path.join(outDir, 'index.html');
  const candidates = [
    path.join(outDir, `${pathname}.html`),
    path.join(outDir, pathname, 'index.html'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

const missing = locs.filter((loc) => resolveOutFile(loc) === null);

if (missing.length > 0) {
  console.error(`\n[error] サイトマップに実体の無いURLが ${missing.length} 件あります:`);
  for (const loc of missing) console.error(`  - ${loc}`);
  console.error('\ncheck:sitemap failed');
  process.exit(1);
}

console.log(`✓ check:sitemap passed: ${locs.length} URLs すべてに対応する出力が存在します`);
```

`package.json` の `scripts` に追加(`check:posts` の直後の行):

```json
    "check:sitemap": "node scripts/check-sitemap.mjs",
```

- [ ] **Step 2: 検証スクリプトが現状で失敗することを確認する**

```bash
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs && npm run check:sitemap
```

期待する結果: 最後の `check:sitemap` が **FAIL**。以下3件が列挙される。

```
[error] サイトマップに実体の無いURLが 3 件あります:
  - https://xyzack271.com/gear/Lofreeflow2
  - https://xyzack271.com/gear/Rainy75
  - https://xyzack271.com/gear/fifineSC3
```

3件以外が出た場合はそこで止めてプランを見直すこと(前提が変わっている)。

- [ ] **Step 3: gear 個別 URL の出力を止める**

`scripts/generate-sitemap.mjs` から gear スラッグの収集(49-56行)を削除する。

削除する塊その1:

```js
// Gear items
const gearDir = path.join(__dirname, '../content/my-gear');
const gearSlugs = fs.existsSync(gearDir)
  ? fs.readdirSync(gearDir)
      .filter((f) => f.endsWith('.mdx'))
      .filter((f) => getPublished(path.join(gearDir, f)))
      .map((f) => f.replace(/\.mdx$/, ''))
  : [];
```

置き換え後(なぜ出力しないかを残す):

```js
// gear は一覧ページ(/gear)のみで、個別ページ(/gear/<slug>)のルートは存在しない。
// 個別URLをサイトマップに載せると404を検索エンジンに通知することになるため出力しない。
// 個別ページを作る場合は app/gear/[slug]/page.tsx を追加してからここに戻すこと。
```

削除する塊その2(`urlEntries` 配列の最後の要素)。これは丸ごと削除する(置き換え無し):

```js
  ...gearSlugs.map((slug) => `  <url>
    <loc>${baseUrl}/gear/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
```

最後にログ行(97行)を修正:

```js
console.log(`✓ sitemap.xml generated: ${staticPages.length} static + ${slugs.length} posts = ${urlEntries.length} URLs`);
```

- [ ] **Step 4: `app/sitemap.ts` を削除する**

```bash
git rm app/sitemap.ts
```

- [ ] **Step 5: 検証スクリプトが通ることを確認する**

```bash
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs && npm run check:sitemap
```

期待する結果:
- `next build` が成功する(`app/sitemap.ts` の削除で参照エラーが出ないこと)
- `✓ sitemap.xml generated: 6 static + N posts = ... URLs` と表示される
- `✓ check:sitemap passed: ... URLs すべてに対応する出力が存在します`

- [ ] **Step 6: CI に載せる**

`.github/workflows/validate.yml` の `Build` ステップ(`run: |` ブロックの最終行が `node scripts/generate-sitemap.mjs`)の直後に、新しいステップを追加する:

```yaml
      - name: Check sitemap URLs
        run: npm run check:sitemap
```

- [ ] **Step 7: コミット**

```bash
git add scripts/check-sitemap.mjs scripts/generate-sitemap.mjs package.json .github/workflows/validate.yml
git commit -F - <<'MSG'
fix: サイトマップから存在しない gear 個別URLを除外し、整合を機械検品する

/gear/<slug> のルートが無いまま sitemap.xml に3件出力しており、
検索エンジンに404を通知していた。生成元も app/sitemap.ts と
scripts/generate-sitemap.mjs の2系統あり、前者は後者に上書きされる
デッドコードだったため削除して一本化した。

回帰防止として scripts/check-sitemap.mjs を追加し、CI で
sitemap.xml の全URLに対応する出力があるか検証する。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
```

---

## Task 2: UI に残った英語のプレースホルダー文言を日本語にする

**背景:** `components/FilteredBlogList.tsx` は `/reviews` の記事一覧で使われており、開発中の文言 `Testing displaying {n} matches` が本番に出ている。空状態の `No articles found with this tag.` も英語のまま。日本語サイトなので両方直す。

**Files:**
- Modify: `components/FilteredBlogList.tsx:51-53, 69-73`

**Interfaces:**
- Consumes: なし(Task 1 と独立。順序入れ替え可)
- Produces: なし

- [ ] **Step 1: 現状の文言がビルド成果物に出ていることを確認する**

```bash
grep -o "Testing displaying" out/reviews.html
```

期待する結果: `Testing displaying` が出力される(= 本番 HTML に含まれている)。
`out/` が無い場合は先に検証ビルドを実行する。

- [ ] **Step 2: 件数表示を日本語にする**

`components/FilteredBlogList.tsx` の 51-53 行:

```tsx
      {/* Results Count */}
      <div className="text-center text-muted-foreground text-sm">
        Testing displaying {filteredPosts.length} matches
      </div>
```

を次に置き換える。タグ選択中は何で絞っているかも示す:

```tsx
      {/* Results Count */}
      <div className="text-center text-muted-foreground text-sm">
        {selectedTag ? `#${selectedTag} の記事 ${filteredPosts.length} 件` : `全 ${filteredPosts.length} 件`}
      </div>
```

- [ ] **Step 3: 空状態を日本語にする**

同ファイルの 69-73 行:

```tsx
      {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
              No articles found with this tag.
          </div>
      )}
```

を次に置き換える:

```tsx
      {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
              このタグの記事はまだありません。
          </div>
      )}
```

- [ ] **Step 4: ビルドして英語文言が消えたことを確認する**

```bash
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs
grep -c "Testing displaying\|No articles found" out/reviews.html
```

期待する結果: `grep -c` が `0` を出力する(該当行なしなので exit 1 になるのが正常)。

- [ ] **Step 5: ブラウザで表示とタグ切り替えを確認する**

`preview_start` で dev サーバーを開き `/reviews` を表示する。確認事項:
1. 初期表示が `全 N 件` で、`N` が published な記事数と一致する
2. タグを1つ選ぶと `#<タグ名> の記事 N 件` に変わり、下に並ぶ記事カードの枚数と一致する
3. `All` に戻すと初期表示に戻る
4. `read_console_messages` でエラーが出ていない

スクリーンショットを撮ってユーザーに共有する。

- [ ] **Step 6: コミット**

```bash
git add components/FilteredBlogList.tsx
git commit -F - <<'MSG'
fix: 記事一覧の件数表示と空状態を日本語にする

/reviews に開発中の文言 "Testing displaying N matches" がそのまま
出ていた。空状態の英文もあわせて日本語にし、タグ選択中は何で
絞り込んでいるかが分かる表示にした。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
```

---

## Task 3: 英語の汎用メタ説明を、3分野を含む日本語の説明に差し替える

**背景:** `The best gadget reviews and tech news.` が `<meta name="description">`・OG・Twitter カードに出ている。検索結果とSNS共有時に表示される文言なので日本語にする。タグページの `Posts tagged with #...` / `Articles tagged with #...` も同様。

説明文は `docs/blog-growth-roadmap.md` のトップ説明文案をそのまま採用する:

> デスクも、持ち歩きも、使い心地で選ぶ。ガジェットの実体験と、AI・プログラミングで日常を快適にする工夫を紹介します。

**Files:**
- Modify: `app/layout.tsx:17, 20, 37`
- Modify: `app/page.tsx:11, 20`
- Modify: `app/tags/[tag]/page.tsx:21-35`

**Interfaces:**
- Consumes: なし
- Produces: なし

- [ ] **Step 1: `app/layout.tsx` の3箇所を差し替える**

`description: 'The best gadget reviews and tech news.',` が3箇所(トップレベル / `openGraph` 内 / `twitter` 内)にある。すべて次に置き換える:

```tsx
  description: 'デスクも、持ち歩きも、使い心地で選ぶ。ガジェットの実体験と、AI・プログラミングで日常を快適にする工夫を紹介します。',
```

- [ ] **Step 2: `app/page.tsx` の該当箇所を差し替える**

同じ英文が `openGraph` と `twitter` にある。`app/layout.tsx` と同じ日本語文に置き換える。

同一文字列を2ファイル・5箇所に書くことになるが、この段階では定数化しない(抽象化するほどの数ではない)。Task 4 で `lib/metadata.ts` を作るので、そこへ置きたくなったら Task 4 の中で移す。

- [ ] **Step 3: `app/tags/[tag]/page.tsx` の英語文言を差し替える**

`generateMetadata` の `return` を次のようにする(`siteImage` の行は既存のまま残す):

```tsx
  return {
    title: `#${decodedTag} の記事`,
    description: `「${decodedTag}」に関する記事の一覧です。`,
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

- [ ] **Step 4: ビルドして英文が消え日本語が入ったことを確認する**

```bash
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs
grep -c "The best gadget reviews" out/index.html
grep -o "デスクも、持ち歩きも、使い心地で選ぶ" out/index.html | head -1
grep -c "Posts tagged with\|Articles tagged with" out/tags/*.html
```

期待する結果:
- 1つ目の `grep -c` が `0`
- 2つ目の `grep -o` が `デスクも、持ち歩きも、使い心地で選ぶ` を出力する
- 3つ目の `grep -c` が全ファイルで `0`

- [ ] **Step 5: コミット**

```bash
git add app/layout.tsx app/page.tsx "app/tags/[tag]/page.tsx"
git commit -F - <<'MSG'
fix: メタ説明を英語の汎用文から日本語に差し替える

description / OG / Twitter カードに "The best gadget reviews and
tech news." が入っており、検索結果とSNS共有で英文が出ていた。
docs/blog-growth-roadmap.md のトップ説明文案に差し替え、
タグページの英語文言もあわせて日本語にした。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
```

---

# Phase B: SEO 基盤

## Task 4: 全ページに canonical URL を出力する

**背景:** `alternates.canonical` がどのページにも無い。静的エクスポート + Cloudflare Pages では、末尾スラッシュ有無や `*.pages.dev` のプレビュードメインなど同一内容の別URLが生じうるため、正規URLを明示する。

**設計判断:** ページごとに絶対URLを手書きすると `getBaseUrl()` の呼び出しが散らばるので、`lib/metadata.ts` に小さなヘルパーを1つ置く。責務はパス → `alternates` オブジェクトの生成のみで、それ以上のことはしない。

**Files:**
- Create: `lib/metadata.ts`
- Modify: `app/page.tsx`, `app/reviews/page.tsx`, `app/about/page.tsx`, `app/gear/page.tsx`, `app/contact/page.tsx`, `app/privacy-policy/page.tsx`, `app/tags/[tag]/page.tsx`, `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getBaseUrl()` from `lib/utils.ts`
- Produces: `canonicalOf(pathname: string): { canonical: string }` — 先頭スラッシュ付きのパス(ルートは `'/'`)を受け取り、`{ canonical: '<baseUrl><pathname>' }` を返す。`Metadata['alternates']` にそのまま渡せる形

- [ ] **Step 1: ヘルパーを作る**

`lib/metadata.ts` を新規作成:

```ts
import { getBaseUrl } from '@/lib/utils';

/**
 * 正規URL(canonical)を組み立てる。
 * pathname は先頭スラッシュ付き。ルートは '/' を渡す。
 * 戻り値は Metadata['alternates'] にそのまま渡せる形。
 */
export function canonicalOf(pathname: string): { canonical: string } {
  const base = getBaseUrl().replace(/\/$/, '');
  const path = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return { canonical: `${base}${path}` };
}
```

- [ ] **Step 2: 各ページの metadata に `alternates` を足す**

各ファイルの先頭に import を追加し、

```tsx
import { canonicalOf } from '@/lib/metadata';
```

`metadata` オブジェクト(または `generateMetadata` の戻り値)へ1行足す:

| ファイル | 追加する行 |
|---|---|
| `app/page.tsx` | `alternates: canonicalOf('/'),` |
| `app/reviews/page.tsx` | `alternates: canonicalOf('/reviews'),` |
| `app/about/page.tsx` | `alternates: canonicalOf('/about'),` |
| `app/gear/page.tsx` | `alternates: canonicalOf('/gear'),` |
| `app/contact/page.tsx` | `alternates: canonicalOf('/contact'),` |
| `app/privacy-policy/page.tsx` | `alternates: canonicalOf('/privacy-policy'),` |

`app/tags/[tag]/page.tsx` は `generateMetadata` の戻り値に(`tag` はエンコード済みの値をそのまま使う):

```tsx
    alternates: canonicalOf(`/tags/${tag}`),
```

`app/blog/[slug]/page.tsx` は `generateMetadata` の戻り値に:

```tsx
    alternates: canonicalOf(`/blog/${slug}`),
```

`app/layout.tsx` には `alternates` を**足さない**。ルートレイアウトに書くと全ページが同じ canonical を継承してしまう。

`app/portfolio/page.tsx` と `app/tools/image-editor/page.tsx` は `noindex` なので canonical は不要。触らない。

- [ ] **Step 3: ビルドして各ページに canonical が出ることを確認する**

```bash
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs
for f in out/index.html out/reviews.html out/about.html out/gear.html out/contact.html out/privacy-policy.html out/blog/satray-mobilebattery-review.html; do
  echo "--- $f"; grep -o 'rel="canonical" href="[^"]*"' "$f"
done
```

期待する結果: それぞれ1件ずつ、自分自身の絶対URLが出る。例:

```
--- out/index.html
rel="canonical" href="https://xyzack271.com/"
--- out/reviews.html
rel="canonical" href="https://xyzack271.com/reviews"
```

canonical が出ないファイルがあれば、そのページの `metadata` に `alternates` を足し忘れている。

- [ ] **Step 4: noindex ページに canonical が付いていないことを確認する**

```bash
grep -c 'rel="canonical"' out/portfolio.html
```

期待する結果: `0`。

- [ ] **Step 5: コミット**

```bash
git add lib/metadata.ts app/
git commit -F - <<'MSG'
feat: 全インデックス対象ページに canonical URL を出力する

alternates.canonical がどのページにも無く、末尾スラッシュ有無や
プレビュードメインで同一内容の別URLが生じうる状態だった。
lib/metadata.ts に canonicalOf() を追加し、各ページの metadata から
自分自身の絶対URLを出力する。noindex の /portfolio と
/tools/image-editor は対象外。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
```

---

## Task 5: 更新日フィールド `updated` を導入し、表示・構造化データ・サイトマップを揃える

**背景:** `app/blog/[slug]/page.tsx:149` の JSON-LD が `dateModified: post.date` になっており、公開日と更新日が常に同じ。ロードマップの「その後のレビュー」「長期使用の追記」を回すと既存記事を更新することになるので、更新日を持てるようにする。

**設計判断:** ロードマップの注意書き「日付だけ更新しない」に従い、**`updated` を書いたら記事画面・JSON-LD・サイトマップの3箇所すべてに反映される**ようにする。`updated` は任意フィールドで、未設定なら現状どおり `date` にフォールバックする。既存記事の内容は変更しない。

**Files:**
- Modify: `lib/mdx.ts`(`BlogPost` 型と frontmatter の読み取り)
- Modify: `app/blog/[slug]/page.tsx:149` 付近(JSON-LD)+ 日付表示箇所
- Modify: `scripts/generate-sitemap.mjs`(`getPostDate` の隣に `getPostLastmod` を追加)
- Modify: `scripts/validate-posts.mjs`(`updated` の形式と前後関係を検証)
- Modify: `tina/config.ts`(post コレクションにフィールド追加)
- Modify: `CLAUDE.md`(フロントマターの YAML ブロックに1行追加)

**Interfaces:**
- Consumes: `BlogPost` from `lib/mdx.ts`
- Produces: `BlogPost.updated?: string` — `YYYY-MM-DD` 形式の任意フィールド。未設定時は `undefined`

- [ ] **Step 1: 検品ルールを先に足す**

`scripts/validate-posts.mjs` の `validatePost` 内、`date` の検証の直後に追加する:

```js
  // updated は任意。設定する場合は YYYY-MM-DD 形式で、date 以降であること。
  if (data.updated !== undefined) {
    const updatedStr = String(data.updated);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedStr)) {
      report(list, label, `updated が YYYY-MM-DD 形式ではありません: ${updatedStr}`);
    } else if (data.date && updatedStr < String(data.date)) {
      report(list, label, `updated (${updatedStr}) が date (${data.date}) より前になっています`);
    }
  }
```

`data` は gray-matter の frontmatter オブジェクト。既存コードでの変数名が異なる場合は `scripts/validate-posts.mjs:81-118` を読んで実際の名前に合わせること。

- [ ] **Step 2: 検品ルールが効くことを一時ファイルで確認する**

既存記事をコピーして不正な `updated` を入れ、単一ファイル検証にかける:

```bash
cp content/posts/wwdc26-summary.mdx /tmp/updated-check.mdx
sed -i '0,/^date:/s//updated: "2020-01-01"\ndate:/' /tmp/updated-check.mdx
node scripts/validate-posts.mjs /tmp/updated-check.mdx
```

期待する結果: `updated (2020-01-01) が date (...) より前になっています` を含むメッセージが出て非ゼロ終了する。

確認できたら消す:

```bash
rm /tmp/updated-check.mdx
```

- [ ] **Step 3: `lib/mdx.ts` の型と読み取りに `updated` を足す**

`BlogPost` インターフェースに追加:

```ts
  updated?: string;
```

frontmatter からオブジェクトを組み立てている箇所に追加:

```ts
    updated: data.updated ? String(data.updated) : undefined,
```

実際のプロパティ組み立て箇所は `lib/mdx.ts` を読み、既存の `date` の扱いと同じ書き方に合わせること。

- [ ] **Step 4: 記事ページの JSON-LD と表示を更新日対応にする**

`app/blog/[slug]/page.tsx` の JSON-LD(149行付近):

```tsx
    dateModified: post.updated ?? post.date,
```

記事本文上部の日付表示(`<time>` 要素)の直後に、更新日がある場合だけ追記する:

```tsx
        {post.updated && post.updated !== post.date && (
          <span className="text-xs text-muted-foreground ml-2">
            (最終更新: {post.updated})
          </span>
        )}
```

挿入位置と `className` は、周囲の既存の日付表示の書き方に合わせること。

- [ ] **Step 5: サイトマップの `lastmod` を更新日対応にする**

`scripts/generate-sitemap.mjs` の `getPostDate` 関数の下に追加:

```js
// サイトマップの lastmod。updated があればそれを、無ければ date を使う。
function getPostLastmod(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.match(/^updated:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/m);
  if (updated) return updated[1];
  return getPostDate(filePath);
}
```

記事URLを組み立てている箇所(70行付近)を差し替える:

```js
  ...slugs.map((slug) => {
    const date = getPostLastmod(path.join(postsDir, `${slug}.mdx`));
```

- [ ] **Step 6: TinaCMS スキーマにフィールドを足す**

`tina/config.ts` の post コレクションの `fields` に、`date` フィールドの直後へ追加:

```ts
        {
          type: 'string',
          name: 'updated',
          label: '最終更新日 (YYYY-MM-DD / 任意)',
          description: '記事を実質的に加筆・修正したときだけ設定する。表示・構造化データ・サイトマップに反映される。',
        },
```

- [ ] **Step 7: CLAUDE.md のフロントマター例に追記する**

`### 記事 (content/posts/*.mdx)` の YAML ブロック、`date: "YYYY-MM-DD"` の次の行に追加:

```yaml
updated: "YYYY-MM-DD"  # 任意: 加筆・修正した日。表示・JSON-LD の dateModified・sitemap の lastmod に反映
```

- [ ] **Step 8: 既存記事1本に `updated` を入れて end-to-end で確認する**

検証用に一時的に `content/posts/wwdc26-summary.mdx` の frontmatter へ `updated: "2026-09-08"` を追加し、次を実行:

```bash
npm run check:posts
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs && npm run check:sitemap
grep -o '"dateModified":"[^"]*"' out/blog/wwdc26-summary.html
grep -B1 -A2 'wwdc26-summary' out/sitemap.xml | grep lastmod
grep -o '最終更新: 2026-09-08' out/blog/wwdc26-summary.html
```

期待する結果:
- `check:posts` と `check:sitemap` が通る
- `"dateModified":"2026-09-08"`
- `<lastmod>2026-09-08</lastmod>`
- `最終更新: 2026-09-08`

3箇所すべてが揃っていなければ、揃っていない箇所の Step に戻る。

確認できたら **`updated` の追加を取り消す**(実際に加筆していない記事の更新日を偽らないため):

```bash
git checkout content/posts/wwdc26-summary.mdx
```

- [ ] **Step 9: コミット**

```bash
git add lib/mdx.ts "app/blog/[slug]/page.tsx" scripts/generate-sitemap.mjs scripts/validate-posts.mjs tina/config.ts CLAUDE.md
git commit -F - <<'MSG'
feat: 記事に updated フロントマターを追加し更新日を一貫して扱う

JSON-LD の dateModified が post.date 固定で、記事を加筆しても
更新日を表明できなかった。任意フィールド updated を追加し、
設定した場合は記事画面の表示・JSON-LD の dateModified・sitemap の
lastmod の3箇所すべてに反映されるようにした。未設定なら従来どおり
date にフォールバックする。日付だけが独り歩きしないよう
check:posts で形式と date との前後関係を検証する。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
```

---

# Phase C: 初回表示の体験

## Task 6: オープニング演出が閲覧開始を3秒遅らせる問題を直す

**背景と訂正:** `components/OpeningAnimation.tsx:37-43` に3秒の `setTimeout` と、その後 0.5 秒待ってヘッダーを出す処理がある。この間ホームのコンテンツとナビゲーションが操作できない。

ただし Codex の記述より影響範囲は狭い。`OpeningAnimation` は `app/page.tsx:41` の**ホームだけ**で使われており、検索流入の着地点である記事ページは遮られていない。したがって「検索流入の直帰」への影響は限定的で、これは**ホーム初回訪問時のUX修正**として扱う。

**設計判断:** 演出を消すのではなく、**閲覧を遮らないようにする**。

- 待機を 3000ms → 1200ms に短縮する
- ヘッダーを演出の終了後ではなく**即座に**出す(ナビゲーションを最初から使えるようにする)
- 演出中のクリック / キー入力 / スクロールで即座にスキップできるようにする
- `prefers-reduced-motion: reduce` の環境では演出を完全にスキップする

`sessionStorage` による「セッション中1回だけ」の制御は現状のまま維持する。

**Files:**
- Modify: `components/OpeningAnimation.tsx:12-46`(state と useEffect)、54行(exit の duration)

**Interfaces:**
- Consumes: `useUIStore().showHeader` from `@/lib/store/ui-store`
- Produces: なし

- [ ] **Step 1: 現状の挙動をブラウザで記録する**

`preview_start` で dev サーバーを開きホームを表示する。`javascript_tool` で:

```js
sessionStorage.removeItem('hasVisited'); location.reload();
```

リロード直後に `read_page` を実行し、ヘッダーのナビゲーションリンクが**取得できない**ことを確認する(これが修正対象の状態)。

- [ ] **Step 2: 演出をスキップ可能・非ブロッキングにする**

`components/OpeningAnimation.tsx` の `useState` 行から `useEffect` の終わりまでを、次に置き換える。モジュールスコープの `let hasShownInSession = false;`(10行目)はそのまま残す:

```tsx
export const OpeningAnimation = () => {
  const [show, setShow] = useState(!hasShownInSession);
  const showHeader = useUIStore((state) => state.showHeader);

  // 演出の有無にかかわらず、ヘッダー(=ナビゲーション)は最初から使えるようにする。
  useEffect(() => {
    showHeader();
  }, [showHeader]);

  useEffect(() => {
    if (hasShownInSession) {
      setShow(false);
      return;
    }

    // アニメーションを減らす設定の環境では演出しない。
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasVisitedStorage = sessionStorage.getItem('hasVisited');

    if (hasVisitedStorage || prefersReducedMotion) {
      hasShownInSession = true;
      setShow(false);
      return;
    }

    sessionStorage.setItem('hasVisited', 'true');

    const finish = () => {
      hasShownInSession = true;
      setShow(false);
    };

    // 待機は最小限にし、操作があれば即座に終了する。
    const timer = setTimeout(finish, 1200);
    window.addEventListener('pointerdown', finish);
    window.addEventListener('keydown', finish);
    window.addEventListener('wheel', finish, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('wheel', finish);
    };
  }, []);
```

`useEffect` は client component 内でのみ実行されるため `window` の存在チェックは不要(ファイル先頭に `"use client";` がある)。

- [ ] **Step 3: 終了アニメーションを短くする**

同ファイル 54 行の `exit` を 0.8 秒から 0.35 秒にする:

```tsx
            exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
```

- [ ] **Step 4: 挙動をブラウザで確認する**

dev サーバーのホームに対し、`javascript_tool` で次を実行してそれぞれ確認する。

(a) ヘッダーが演出中から使える:
```js
sessionStorage.removeItem('hasVisited'); location.reload();
```
リロード直後に `read_page` を実行し、ヘッダーのナビゲーションリンクが**演出中でも取得できる**こと。

(b) クリックでスキップできる:
```js
sessionStorage.removeItem('hasVisited'); location.reload();
```
リロード直後に `computer` でページ中央をクリックし、`read_page` で演出のオーバーレイが消えていること。

(c) 2回目以降は出ない:
```js
location.reload();
```
`sessionStorage` を消さずにリロードし、演出が出ないこと。

(d) `read_console_messages` でエラーが出ていないこと。

- [ ] **Step 5: スクリーンショットを撮ってユーザーに共有する**

演出中と演出後の2枚を撮り、演出中からヘッダーが見えていることを示す。

- [ ] **Step 6: コミット**

```bash
git add components/OpeningAnimation.tsx
git commit -F - <<'MSG'
fix: オープニング演出が閲覧開始を遮らないようにする

ホーム初回訪問時に3秒の待機があり、その間コンテンツも
ナビゲーションも操作できなかった。ヘッダーの表示を演出の完了待ちから
切り離して即座に出し、待機を1.2秒へ短縮、クリック・キー入力・
スクロールで即スキップできるようにした。prefers-reduced-motion の
環境では演出しない。セッション中1回だけの制御は従来どおり。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
```

---

## 完了後の確認

全タスク完了後、以下がすべて通ることを確認してから PR を作る。

```bash
npm run check:posts
npx next build && node scripts/setup-image-cache.mjs && npx next-image-export-optimizer && node scripts/generate-sitemap.mjs
npm run check:sitemap
npm run lint
```

PR は Phase 単位で分けてよい(Phase A / Phase B / Phase C)。マージは人間が行う。

デプロイ後に確認すること:
- `https://xyzack271.com/sitemap.xml` に `/gear/<slug>` が含まれていないこと
- Search Console でサイトマップを再送信し、404 の報告が消えること
- `/reviews` に英語の文言が出ていないこと
- 記事ページの HTML に `rel="canonical"` があること

実施後は `docs/blog-growth-roadmap.md` の該当項目に日付と変更内容を記録する(同文書の指示)。

---

## このプランに含めなかった項目と、その理由

`docs/blog-growth-roadmap.md` の残りは、コードだけでは決められない判断を含むため別扱いにした。着手する際は該当項目についてユーザーに確認してから、それぞれ別プランにする。

| 項目 | 含めなかった理由 | 決める必要があること |
|---|---|---|
| タグの整理(34件中28件が1記事) | ロードマップ自身が「記事数だけで一括 noindex にしない」と釘を刺している。どのタグを残し、どれを統合し、`/reviews` のフィルタをタグとカテゴリのどちらで回すかは編集判断 | 残すタグの基準、統合先、既存URLの扱い(静的エクスポートなのでリダイレクトは Cloudflare Pages 側の設定になる) |
| カテゴリを3分野(ガジェット / AI活用 / 開発ノート)へ再編 | 既存11カテゴリの割り当て替えと `content/data/taxonomy.json` の作り直しを伴い、記事の分類そのものが編集判断。なお現状 `category: ""` の記事が1件、クォート無しの記事が1件あり、棚卸しが必要 | 3分野の正式名称、既存11カテゴリの対応表、`/reviews` とホームの導線をどう変えるか |
| 本文からの内部リンク(まとめ→個別レビュー) | 「現在のデスク環境まとめ」という**まだ存在しない記事**が起点になっている。記事を書いてからでないと着手できない | まとめ記事を書くかどうか |
| GA4 のクリック計測イベント追加 | GA4 管理画面側の既存設定を確認していない。実装側だけ見て「未設定」と断定できない(ロードマップも同じ留保をしている) | 管理画面で拡張計測が有効か、何を計測したいか |
| レビュー記事の品質改善(Satray の「A社」「U社」比較の具体化など) | 記事本文の書き換えであり、`fact-checker` サブエージェントで出典を確認する作業。コード変更ではない | 対象記事と、比較対象の製品名を公開してよいか |
| 月2本の投稿サイクル・連載企画 | 運用の話でコード変更を伴わない。`content/ideas/` への投入はいつでもできる | 実際に書ける題材があるか |
| 優先する事業目標(検索流入 / 収益 / 制作実績) | ロードマップが「未確認」と明記している。ここが決まると上記の優先順位が変わる | ユーザーの意向 |
