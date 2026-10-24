# 記事本文の幅拡大と、表のレスポンシブ化

## 背景

- PC で記事を読むと本文が狭い。記事ページのヘッダー(カバー画像・タイトル)は `max-w-4xl`(896px)なのに、本文は `max-w-3xl`(768px)で、ヘッダーより一段狭くなっている
- スマホで表が崩れる。今の `Table` は `table-fixed` で1列目を 20% に固定している。3〜5列の表では各列が数文字幅まで詰まり、読めない(例: `content/posts/muji-week-2026-autumn.mdx` の「商品 | 価格 | ポイント」、`apple-event-2026-09.mdx` の5列表)
- オーナーの決定(2026-10-24):
  - 本文の幅を全記事で 896px にする
  - PC とスマホで表のレイアウトを変える。全記事に適用する

## 変更対象

触るファイル:

- `app/blog/[slug]/page.tsx` — 本文のコンテナ(316行付近の `max-w-3xl`)を `max-w-4xl` にする。この1か所だけ
- `components/MDXComponents.tsx` — `Table` / `THead` / `TBody` / `TR` / `TH` / `TD`(375〜415行付近)をレスポンシブにする

触らないファイル:

- `content/**` — 記事本文は変えない。既存の Markdown の表記法のまま新しい見た目になること
- `app/privacy-policy/page.tsx` / `app/about/page.tsx` の `max-w-3xl` — 記事ページではないので対象外
- `components/TableOfContents.tsx` ほか、表以外の MDX コンポーネント

## 仕様

### 1. 本文の幅

`app/blog/[slug]/page.tsx` の本文コンテナのクラスを、`max-w-3xl` から `max-w-4xl` に変える。ほかのクラス(`prose prose-lg …`)はそのまま残す。

注意: Tailwind Typography の `prose` は、自分で `max-width: 65ch` を持っている。そのため、コンテナを広げても本文が 65ch で止まる可能性がある。実際にどう表示されるかを確かめること。止まる場合は、同じ要素に `max-w-none` を足す(`max-w-4xl` は外側の要素に付け直す)。結果、本文の幅が 896px − 左右 padding になればよい。

### 2. 表(ブレークポイントは `md` = 768px)

**PC(`md` 以上)**: 今と同じ、ふつうの表。

- `table-fixed` と `[&_tr>*:first-child]:w-[20%]` をやめ、`table-auto` にする(列幅は内容で決まる)
- 外枠(角丸 + 枠線)、見出し行の `bg-primary/10`、行の区切り線、hover の色は今のまま
- 横にはみ出す表に備えて、外側の `overflow-x-auto` は残す

**スマホ(`md` 未満)**: 1行を1枚のカードとして縦に並べる。

- `<thead>` は見た目上は隠す(`sr-only` 相当にするなど。スクリーンリーダーからは読める状態にしておく)
- 各 `<tr>` を1枚のカードにする。カードの間には区切り線か余白を入れる
- **1列目のセル**を、カードの見出しとして太字で出す。ラベルは付けない
- **2列目以降のセル**は、セルごとに「ラベル」と「値」を縦に並べる。
  - ラベル: その列の見出しセル(`<th>`)の中身。小さめの文字に `text-muted-foreground` 系の色
  - 値: セルの中身。今と同じ色
- 見出しセルが空の列(例: `moondrop-ucts.mdx` の1列目 `|  |`)には、ラベルの行を出さない
- セルの中のリンク・太字・`<br>` などは、そのまま表示されること

**ラベルの付け方**:

- `Table` はサーバーコンポーネントのまま実装する(`'use client'` を付けない)
- `Table` が受け取った `children` を React の要素として順にたどる(`React.Children` / `React.isValidElement` / `React.cloneElement`)
  1. thead の中の最初の tr から、各 th の `children`(ReactNode)を列の順に集める
  2. tbody の中の各 tr にある各 td に、その列の見出しを prop で渡す(prop 名は実装に任せる。例: `label`)
- `TD` は、受け取った見出しを `md:hidden` の要素の中に出す。見出しの文字列を取り出して CSS の `data-label` / `content: attr()` に入れる方式は使わない(見出しに太字が入っている表があるため。例: `moondrop-ucts.mdx` の `**U.C.T.S.**`)
- 見出しを渡せなかった場合(thead が無い表、要素の型が想定と違う表)でも、壊れずに表示されること。そのときはラベル無しのカードになればよい
- MDX から渡される要素の `type` は、`mdxComponents` に登録した `THead` / `TBody` / `TR` / `TH` / `TD` の関数そのものになる。`'thead'` のような文字列での比較だけに頼らない(両方を見るか、関数との一致を見る)

**見た目の例(スマホ、muji の表の1行)**:

```
┌─────────────────────────────┐
│ 急速充電ができるモバイル       │  ← 1列目(太字・リンク)
│ バッテリー付充電器 5000mAh…    │
│ 価格                         │  ← ラベル(小さく、薄い色)
│ 2,990円                      │  ← 値
│ ポイント                      │
│ コンセントに挿せば充電器、…    │
└─────────────────────────────┘
```

## 受け入れ条件

Codex 側で実行するもの:

- [ ] `npx tsc --noEmit` が通る
- [ ] `npx eslint components/MDXComponents.tsx "app/blog/[slug]/page.tsx"` で、今回の変更による新しいエラー・警告が無い(既存の指摘と区別して報告する)
- [ ] `git diff --stat` に、変更対象の2ファイル以外が無い

レビュー担当(Claude Code)側で実行するもの(Codex は実行しなくてよい):

- [ ] `next build` が通る(`npm run build` は IndexNow を叩くので使わない)
- [ ] 開発サーバーで、次の4記事を幅 1280px と 390px で開いて確かめる: `/blog/muji-week-2026-autumn`、`/blog/apple-event-2026-09`、`/blog/moondrop-ucts`、`/blog/minecraft-fabric-mod-guide-2025`
  - 1280px: 本文の左端がカバー画像の左端と揃っている(幅 896px)。表はふつうの表で、1列目が 20% に固定されていない
  - 390px: 表がカードになり、横スクロールが出ない。2列目以降に見出しのラベルが付く。moondrop の空の見出し列にはラベルが出ない。リンクと太字がそのまま出る
- [ ] `curl` で取得した HTML の表に、`<table>` `<thead>` `<th>` が残っている(意味のある表としての構造を壊していない)

## 対象外

- 記事本文の Markdown の書き換え(表から箇条書きへの変換など)
- `keyboard-switch-mechanism-guide.mdx` 27行の表の書き方(見出しの区切り行が無い)を直すこと。別件
- 表以外の MDX コンポーネントの見た目
- 固定ページ(about・privacy-policy)の幅

## 想定される落とし穴

- **`prose` の max-width**: 上の「1. 本文の幅」の通り。クラスの付け替えだけで済んだと思い込まない
- **`not-prose`**: 今の `Table` の外側の div には `not-prose` が付いている。カードにしても付けたままにする。外すと、prose の表のスタイルと混ざる
- **`display` の切り替えと表の意味**: スマホで `tr` / `td` を `block` / `grid` にすると、ブラウザによっては表としての意味が失われることがある。今回は見た目を優先してよいが、`<table>` 要素そのものは残す
- **MDX が入れる空白のテキスト**: `children` には要素のほかに改行などの文字列が混ざることがある。`React.Children.map` で要素だけを扱い、文字列はそのまま返す
- **見出しの数と列の数がずれる表**: 列のほうが多いときは、見出しの無い列にラベルを出さない。例外を投げない
- **Codex の環境**: サンドボックスからネットワークに出られないので `next build` は Google Fonts の取得で止まる。ビルドはレビュー担当側で行う(AGENTS.md の「Codex に渡すときの制約」)
