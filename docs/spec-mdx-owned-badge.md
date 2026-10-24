# 記事内で使える「愛用中」バッジ

## 背景

- `content/posts/muji-week-2026-autumn.mdx` では、筆者が持っている商品の名前の横に `**愛用中**` と書いて目印にしている。ただの太字なので、表の中で目立たない(オーナーの指摘、2026-10-25)
- オーナーの決定: テーマカラーの小さなラベル(バッジ)にする。記事の MDX から呼べる部品として追加する

## 変更対象

触るファイル:

- `components/MDXComponents.tsx` — `Owned` コンポーネントを追加し、`mdxComponents` に登録する

触らないファイル:

- `content/**` — 記事側の `**愛用中**` を `<Owned />` に置き換えるのはレビュー担当が行う
- `docs/components.md` — カタログへの追記はレビュー担当が行う
- 上記以外の `components/**` / `app/**`

## 仕様

### 使い方(MDX)

```mdx
| [急速充電器 USB-C 2ポート / USB-A](https://...) <Owned /> | 2,990円 | ... |

筆者が実際に使っている商品には <Owned /> を付けています。
```

- `<Owned />` は「愛用中」と表示する
- `children` を渡したときはその中身を表示する(例: `<Owned>使用中</Owned>`)。渡さなければ「愛用中」

### 見た目

- インライン要素(`<span>`)。文章や表のセルの中で、文字の流れを崩さない
- 背景はテーマカラー(`bg-primary`)、文字は `text-primary-foreground`(白文字は使わない。`#7BABFF` の上の白はコントラストが足りない)
- 小さめの文字(`text-xs` 程度)、太字、`leading-none`、`whitespace-nowrap`(「愛用中」の途中で折り返さない)
- 角丸は控えめ(`rounded-md` 程度)、内側の余白は横 `px-1.5`・縦 `py-0.5` 程度
- 前の文字との間に少し間をあける(`ml-1.5` 程度)。縦位置は周りの文字の中央に揃える(`align-middle` など)
- 親が太字(スマホのカード表示では表の1列目が太字になる)でも、見た目が変わらないこと
- ダークモードでも同じ配色でよい(`--primary` はダークでも同じ値)

### 実装の形

- 既存の `Text` などと同じく、`components/MDXComponents.tsx` 内に関数コンポーネントとして書き、`mdxComponents` に `Owned` の名前で登録する
- `'use client'` は付けない
- 条件付きの className には既存と同じく `cn()` を使う(`className` prop を受けて末尾に足せるようにする)

## 受け入れ条件

Codex 側で実行するもの:

- [ ] `npx tsc --noEmit` が通る
- [ ] `npx eslint components/MDXComponents.tsx` で、今回の変更による新しいエラー・警告が無い(既存の指摘と区別して報告する)
- [ ] `git diff --stat` に `components/MDXComponents.tsx` 以外が無い

レビュー担当(Claude Code)側で実行するもの:

- [ ] `npx next build` が通る(`npm run build` は IndexNow を叩くので使わない)
- [ ] muji の記事で `**愛用中**` を `<Owned />` に置き換え、プレビューの 1280px と 390px で、表のセルの中・段落の中ともにバッジが青地に濃い文字で1行で出る

## 対象外

- 記事本文の書き換え
- 引用(`blockquote`)の見た目の変更
- バッジの色の種類を増やすこと(赤・緑など)

## 想定される落とし穴

- **MDX の表のセル内の JSX**: `remark-gfm` の表のセルの中でも `<Owned />` はインライン JSX として渡る。ブロック要素(`<div>`)にすると表のセルや段落(`P` は `<div>`)の中で崩れるので、必ず `<span>` にする
- **`not-prose`**: 表は `not-prose` の中にあるが、段落は `prose` の中にある。`prose` の `strong` などのスタイルの影響を受けないよう、要素は `strong` ではなく `span` にする
- **Codex の環境**: `next build` はネットワークが要るので実行しない(AGENTS.md の「Codex に渡すときの制約」)
