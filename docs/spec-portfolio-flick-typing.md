# ポートフォリオに「ふりっくタイピング」を追加する

## 背景

オーナーがスマホ向けのタイピングゲーム「ふりっくタイピング」(https://flicktypinggame.xyzack271.com/)を公開した。`/portfolio` に、音骸シミュレーター(鳴潮)と同じ扱いで載せる。具体的には次の4か所。

1. Overview の数字(プロジェクト数)
2. Projects のカード
3. Tech Stack のサブセクション
4. 専用の Features セクション

## 変更対象

触るファイル:

- `app/portfolio/page.tsx` — 下の「仕様」の 1〜6

触らないファイル:

- 上記以外のすべて(`components/**`、`lib/**`、ほかのページ、`package.json` など)

## 仕様

文言は下に書いたものをそのまま使う(全角・半角も含めて)。

### 1. import

`lucide-react` の import に `Keyboard` を足す。ほかのアイコンは足さない(下で使うのは既存の `Timer` `Shield` `Database` `Code2` `Layers` `BarChart2` `ExternalLink` と `Keyboard`)。

### 2. `projects` 配列

音骸シミュレーターの次(配列の最後)に1件足す。

```tsx
{
  name: 'ふりっくタイピング',
  desc: 'スマホ専用のフリック入力タイピングゲーム。60 秒のタイムアタックと、青空文庫の小説を 1 ミスで終了まで打ち続ける日替わりの耐久モード。ログイン不要のランキング付き。',
  badge: 'Vite + TypeScript / Cloudflare Workers',
  tags: ['D1', 'Vitest', 'Anti-cheat', 'TypeScript'],
  href: 'https://flicktypinggame.xyzack271.com',
  icon: <Keyboard size={20} />,
  iconColor: 'text-emerald-400 bg-emerald-400/10',
  borderColor: 'hover:border-emerald-400/40',
  accentGlow: 'bg-emerald-500/10',
},
```

### 3. 新しいデータ配列 `flickTechStack` と `flickFeatures`

`wuwaFeatures` の直後(`architectureItems` の前)に置く。型・形は `wuwaTechStack` / `wuwaFeatures` と同じ。

```tsx
const flickTechStack = [
  {
    name: 'Vite + TypeScript',
    role: 'フロントエンド',
    desc: 'フレームワークを使わず、素の TypeScript で画面とゲームループを実装。軽量なバンドルでスマホでもすぐに起動する。',
    icon: <Code2 size={22} />,
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    name: 'Cloudflare Workers + D1',
    role: 'バックエンド / DB',
    desc: '静的アセットの配信と /api/* の処理を 1 つの Worker で担当。プレイ結果とランキング用のニックネームを D1（SQLite）に保存する。',
    icon: <Database size={22} />,
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    name: '入力挙動の解析',
    role: '不正対策',
    desc: '打鍵のタイミングや入力経路を端末上で解析し、物理キーボードや自動操作ツールからの入力を検出してプレイを止める。',
    icon: <Shield size={22} />,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    name: '再現可能なゲームロジック + Vitest',
    role: '設計 / テスト',
    desc: 'ゲームの進行を「お題と打鍵の列」から完全に再現できる純粋関数で実装。DOM・時刻・乱数に依存しないため、Vitest で判定を細かくテストできる。',
    icon: <Layers size={22} />,
    color: 'text-purple-400 bg-purple-400/10',
  },
];

const flickFeatures = [
  {
    title: 'タイムアタック',
    desc: '持ち時間 60 秒で何文字打てるかを競うモード。コンボを重ねたり、お題をノーミスで打ち切ったりすると残り時間が延びる。',
    icon: <Timer size={20} />,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    title: '日替わりの耐久モード',
    desc: '青空文庫の小説から毎日 1 作品を出題し、全員が同じ文章で競う。1 回でもミスしたら終了。正しく打つたびに残り時間が少しずつ回復する。',
    icon: <Keyboard size={20} />,
    color: 'text-amber-400 bg-amber-400/10',
  },
  {
    title: 'ログイン不要のランキング',
    desc: 'タイムアタックは歴代と今週、耐久はその日と歴代で集計。端末ごとの匿名 ID にニックネームを付けて参加でき、不適切な言葉は弾く。',
    icon: <BarChart2 size={20} />,
    color: 'text-cyan-400 bg-cyan-400/10',
  },
  {
    title: '機械操作の検出',
    desc: 'スマホのキーボードからのタッチ入力だけを受け付ける。PC のブラウザや自動操作ツールによる入力を判定し、記録が送られないようにする。',
    icon: <Shield size={20} />,
    color: 'text-rose-400 bg-rose-400/10',
  },
];
```

### 4. Overview

`<OverviewStat label="プロジェクト数" ...>` を次に変える。

```tsx
<OverviewStat label="プロジェクト数" value="5" sub="Blog / Dashboard / Editor / Simu / Typing" />
```

ほかの OverviewStat は変えない。

### 5. Tech Stack のサブセクション

Tech Stack セクションの中、「音骸シミュレーター — 鳴潮(独立アプリ)」のサブセクションの直後に、同じ構造(`ScrollReveal` + `SubSectionLabel` + グリッド + `TechCard`)のサブセクションを1つ足す。

- ラベル: `ふりっくタイピング（独立アプリ）`(括弧は全角。既存のラベルに合わせる)
- データ: `flickTechStack`
- グリッドの列数・`delay` の計算・`key` の付け方は、直前の音骸シミュレーターのサブセクションと同じにする

### 6. Features セクション

`{/* ── Wuthering Waves Echo Simulator Features ── */}` のセクションの直後、`{/* ── Architecture ── */}` の前に、同じ構造のセクションを1つ足す。

- コメント: `{/* ── Flick Typing Features ── */}`
- `SectionTitle`: `Flick Typing Features`。`ScrollReveal` の `direction` は、直前の音骸のセクションと交互になるよう `"left"` にする
- 説明文:
  `スマホのフリック入力で遊ぶタイピングゲーム。Vite + TypeScript で作り、Cloudflare Workers と D1 でランキングを動かしています。物理キーボードや自動操作ツールによる入力を弾き、指で打った記録だけで競えるようにしました。`
- カード: `flickFeatures` を map。ホバー時の枠線は `hover:border-emerald-400/40`
- 末尾のボタン: 音骸の「ツールを試す」と同じ形で、色を emerald に置き換える(`bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 ... hover:bg-emerald-400/20`)。アイコンは `<Keyboard size={16} />`、文言は `ゲームを遊ぶ`、`href="https://flicktypinggame.xyzack271.com"`、`target="_blank" rel="noopener noreferrer"`、末尾に `<ExternalLink size={14} />`

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npx eslint app/portfolio/page.tsx` で、変更前より指摘が増えていない(リポジトリ全体の `npm run lint` は既存の指摘で exit 1 になるので条件にしない)
- [ ] `git diff --stat` に出るのが `app/portfolio/page.tsx` だけ
- [ ] `/portfolio` に、Projects のカード・Tech Stack のサブセクション・「Flick Typing Features」のセクションが出て、リンク先が https://flicktypinggame.xyzack271.com になっている(レビュー担当が `next build` の出力 `out/portfolio.html` と開発サーバーで確認する)

## 対象外

- ゲーム側のリポジトリの変更
- Hero の文言、Architecture の項目の変更
- スクリーンショット画像の追加
- ポートフォリオの noindex の変更

## 想定される落とし穴

- `projects` は `as const` 付き。足す要素も同じ形(同じキー)にそろえる
- Projects は `md:grid-cols-3` で、5 件目で 2 行目が 2 枚になる。レイアウトは変えずにそのままでよい
- 素の `<img>` は使わない(今回は画像を足さない)
- 文言の括弧は既存に合わせて全角(`（` `）`)。仕様書の文言をコピーするとき、半角に置き換えない
