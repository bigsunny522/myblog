# X(旧 Twitter)の投稿を記事に埋め込む `<XPost>` コンポーネント

## 背景

ニュース記事(週刊のまとめ「デスクガジェット週報」など)で、メーカー公式の X 投稿を本文に埋め込んで見せたい。今は埋め込み用のコンポーネントが無く、リンクを張るしかない。

X 公式の `widgets.js` を読み込む方式は、外部スクリプトの読み込みとレイアウトのずれ(CLS)が起きるため使わない。代わりに **`react-tweet`** の Server Component を使う。ビルド時(静的エクスポート時)に X の公開 API(syndication)から投稿の内容を取ってきて HTML として書き出すので、`output: 'export'` と両立し、閲覧時に外部スクリプトを読まない。

依存の `react-tweet@3.3.1` は Claude Code 側で `package.json` / `package-lock.json` に追加済み。

## 変更対象

触るファイル:

- `components/XPost.tsx`(新規)— 埋め込みコンポーネント本体
- `components/MDXComponents.tsx` — `mdxComponents` に `XPost` を登録する
- `docs/components.md` — 「レイアウト」節に `<XPost>` の使い方を追記する

触らないファイル:

- `package.json` / `package-lock.json` — 依存は追加済み。追加・変更しない
- `app/**` — ページ側の変更は不要
- `content/**` — 記事への埋め込みは Claude Code 側で行う
- `next.config.ts` — 画像の設定は変えない(下記「落とし穴」参照)

## 仕様

### MDX での書き方

```mdx
<XPost id="2121136201092796889" />
<XPost id="2121136201092796889" caption="Keychron Japan 公式の告知" />
```

- `id`(必須, string): 投稿 URL `https://x.com/<user>/status/<id>` の `<id>` 部分
- `caption`(任意, string): 埋め込みの下に小さく表示する説明文

### `components/XPost.tsx`

- Server Component(`'use client'` を付けない)。`react-tweet` の `Tweet`(`import { Tweet } from 'react-tweet'`)を使う
- 外側を `<figure>` で包む。中央寄せ、上下の余白は本文の画像(`ImageModal` / `Figure`)と揃える(`my-8` 程度)。横幅は `react-tweet` の既定(最大 550px)に任せ、スマホ幅ではみ出さないこと
- `caption` があれば `<figcaption>` で埋め込みの下に表示する。既存の `Figure` コンポーネントのキャプションと同じ見た目(文字サイズ・色)に揃える
- `id` が数字だけの文字列でないとき(`/^\d+$/` に合わない)は、何も埋め込まずに `null` を返す。開発時(`process.env.NODE_ENV !== 'production'`)だけ `console.warn` で知らせる
- 投稿が削除済み・取得失敗のときは、`react-tweet` の既定の表示(TweetNotFound)に任せる。**ビルドを失敗させない**こと(`react-tweet` の `Tweet` は取得エラーで例外を投げずに TweetNotFound を描画する。`onError` は渡さない)
- 投稿の元 URL へのリンク(`https://x.com/i/status/<id>`)を、`fallback` として `Tweet` に渡す必要はない(既定の読み込み表示のままでよい)

### テーマ

- サイトのダークモードは `prefers-color-scheme`。`react-tweet` のテーマ CSS は `@media (prefers-color-scheme: dark)` に対応しているので、追加の CSS は原則不要
- 埋め込み枠の背景・枠線が記事の背景から浮きすぎる場合だけ、`.react-tweet-theme` の CSS 変数(`--tweet-bg-color` など)を `components/XPost.tsx` 内のラッパーで上書きしてよい。`app/globals.css` は触らない

### `components/MDXComponents.tsx`

- `import { XPost } from './XPost';` を追加し、`mdxComponents` に `XPost` を登録する。既存の登録の並びと書き方に合わせる

### `docs/components.md`

「レイアウト」節の `<Video>` の後に `### \`<XPost id caption?>\`` を追加する。内容: 用途(メーカー公式などの X 投稿の埋め込み)、書き方の例、ビルド時に取得して静的 HTML になること、削除済みの投稿は「見つかりません」表示になること。

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npx eslint components/XPost.tsx components/MDXComponents.tsx` で、今回の変更に起因する新しいエラーが無い(既存の指摘は対象外。AGENTS.md の lint の注意を参照)
- [ ] `git status` で、変更が「変更対象」の3ファイルだけである

以下はネットワークが要るため、Claude Code 側で確認する(実装担当は実行しなくてよい):

- [ ] `npm run dev` で `<XPost id="2121136201092796889" />` を含む記事を開くと、投稿の本文・アカウント名が表示される
- [ ] ダークモードで埋め込みが暗い配色になる
- [ ] `npx next build` が通り、`out/blog/<slug>/index.html` に投稿の本文が静的 HTML として含まれる

## 対象外

- 記事本文への埋め込み(Claude Code 側で行う)
- YouTube・Instagram など X 以外の埋め込み
- X の `widgets.js` 方式

## 想定される落とし穴

- **静的エクスポート**: `XPost` に `dynamic = 'force-dynamic'` やリクエスト時の `headers()` / `cookies()` を使わない。`Tweet`(Server Component)はビルド時に取得するだけなので、そのままで静的エクスポートと両立する
- **`'use client'` を付けない**: クライアント版(`react-tweet` の `index.client` / SWR)を使うと閲覧時に外部取得が走る。必ず Server Component の `Tweet` を使う
- **画像**: `react-tweet` は投稿の画像を `pbs.twimg.com` の素の `<img>` で出す。リポジトリの「素の `<img>` を使わない」ルールはローカル画像の最適化のためのもので、外部の埋め込みはこの例外とする。`next.config.ts` の `images` 設定は変えない
- **ネットワーク**: 実装担当のサンドボックスはネットワークに出られないため、`next build` / `next dev` での表示確認はしなくてよい。`npx tsc --noEmit` まで通せば完了とする
- **エンコーディング**: `.md` は BOM 無し UTF-8。`docs/components.md` を PowerShell のテキスト入出力で書き戻さない
