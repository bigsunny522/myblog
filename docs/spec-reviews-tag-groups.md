# 仕様書: `/reviews` のタグフィルタを3軸のグループ別に表示する

## 1. 背景

2026-09-10 に記事タグを「ジャンル / メーカー / 記事の形式」の3軸に整理し、`content/data/taxonomy.json` を次の形に変えた(c50b44a 以降)。

```json
{
  "categories": ["レビュー", "ニュース", ...],
  "tagGroups": {
    "ジャンル":   ["オーディオ", "デスク環境", ...],
    "メーカー":   ["Apple", "BenQ", ...],
    "記事の形式": ["レビュー", "ニュース", ..., "PR"]
  }
}
```

一方で `/reviews` のタグフィルタ(`components/FilteredBlogList.tsx`)は、全タグを1列にフラットに並べている。並び順も記事の出現順で、ジャンルとメーカーと形式が混ざって読みにくい。これを taxonomy.json のグループ単位で見出し付きの行に分けて表示する。

## 2. 変更対象

触るファイル(この2つだけ):

| ファイル | 変更内容 |
|---|---|
| `app/reviews/page.tsx` | `allTags` の算出をやめ、taxonomy.json の `tagGroups` からグループ配列を組み立てて渡す |
| `components/FilteredBlogList.tsx` | props を `allTags: string[]` から `tagGroups: TagGroup[]` に変え、グループごとに行を分けて描画する |

触らないファイル:

- `content/data/taxonomy.json`(グループ名と並び順はレビュー担当が管理する。**表示順は taxonomy.json の並び順そのまま**にする)
- `components/BlogList.tsx` / `app/tags/[tag]/page.tsx` / `app/blog/[slug]/page.tsx` / `lib/mdx.ts` / `scripts/**`
- `content/**` の記事

### 2-1. `app/reviews/page.tsx`

- `import taxonomy from '@/content/data/taxonomy.json';` で読み込む(`tsconfig.json` は `resolveJsonModule: true`。`@/*` は `./*` を先に解決する)
- `getAllPosts()` の結果から、一覧に出る記事で**実際に使われているタグだけ**を集める
- `Object.entries(taxonomy.tagGroups)` の順にグループを作り、各グループ内は taxonomy.json の並び順を保ったまま、使われているタグだけに絞る
- どのグループにも属さないタグが使われていた場合は、末尾に `{ label: 'その他', tags: [...] }` として追加する(通常は `npm run check:posts` が弾くので発生しないが、表示から黙って消えないようにするための保険)
- タグが0件になったグループは渡さない

実装例(この通りでなくてよい):

```ts
const usedTags = new Set(posts.flatMap((post) => post.tags ?? []).filter(Boolean));
const groups = Object.entries(taxonomy.tagGroups).map(([label, tags]) => ({
  label,
  tags: tags.filter((tag) => usedTags.has(tag)),
}));
const grouped = new Set(groups.flatMap((g) => g.tags));
const others = [...usedTags].filter((tag) => !grouped.has(tag));
if (others.length > 0) groups.push({ label: 'その他', tags: others });
const tagGroups = groups.filter((g) => g.tags.length > 0);
```

### 2-2. `components/FilteredBlogList.tsx`

- `export interface TagGroup { label: string; tags: string[] }` を定義し、props を `{ posts: BlogPost[]; tagGroups: TagGroup[] }` にする
- 描画の構成:
  - 1行目: `All` ボタン(中央寄せ、今のボタンと同じ見た目)
  - 2行目以降: グループごとに1行。行頭にグループ名の見出し(`text-xs font-semibold text-muted-foreground`)を置き、その後ろにそのグループのタグボタンを並べる。行は `flex flex-wrap items-center justify-center gap-2`、行間は `space-y-3` 程度
  - 各行に `role="group"` と `aria-label={group.label}` を付ける
- タグボタンの見た目(className)、選択は1つだけという挙動、選択中のボタンを押すと解除される挙動、件数表示、空状態の文言、framer-motion のアニメーションは**すべて今のまま**にする

## 3. 受け入れ条件

Codex が実行して確認するもの:

1. `npx.cmd tsc --noEmit` が exit 0
2. `npx.cmd eslint app/reviews/page.tsx components/FilteredBlogList.tsx` で、変更した行にエラーが出ていない(既存の指摘があれば、変更前からあるものと区別して報告する)
3. `git status --short` で変更されているのが上の2ファイルだけ

レビュー担当(Claude Code)が実行して確認するもの(Codex はネットワークに出られないので実行しない):

4. `npx next build` が成功する
5. `out/reviews.html` に `ジャンル` `メーカー` `記事の形式` の見出しがこの順で出ている
6. `out/reviews.html` のタグボタンの数が、一覧に出る記事で使われているユニークなタグの数と一致する(重複も欠落もない)
7. ブラウザで `/reviews` を開き、タグを押すと記事が絞り込まれ、`#<タグ> の記事 N 件` の N がカードの枚数と一致する。もう一度押すと解除される

## 4. 対象外

- `/tags/[tag]` ページや記事ページのタグ表示の変更
- 複数タグの同時選択(AND / OR 絞り込み)
- `All` ボタンの文言の日本語化
- taxonomy.json のグループ名や並び順の変更
- カテゴリでの絞り込み

## 5. 想定される落とし穴

- **`FilteredBlogList` は `"use client"` のコンポーネント。** taxonomy.json の読み込みとグループの組み立ては、サーバーコンポーネントの `app/reviews/page.tsx` 側で行い、シリアライズできる配列として渡す。`fs` をクライアント側に持ち込まない
- **静的エクスポート(`output: 'export'`)である。** リクエスト時に動く処理(`headers()` や `dynamic = 'force-dynamic'` など)を足さない
- **`FilteredBlogList` を使っているのは `app/reviews/page.tsx` だけ**(2026-09-10 時点)。props の名前を変えるので、編集前に `FilteredBlogList` を grep してほかに呼び出し元がないか確認する
- **下書き記事(`published: false`)と `listed: false` の記事は、`getAllPosts()` が既に除外している。** 「使われているタグ」はこの結果から集めればよく、taxonomy.json に載っていても一覧の記事で使われていないタグ(例: 非公開記事にだけ付いている `Dell`)は表示しない
- `Object.entries` はオブジェクトの文字列キーを挿入順で返すので、グループ順は taxonomy.json の記述順になる。ソートし直さない
