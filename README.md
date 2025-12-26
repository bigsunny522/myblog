# My Terminal Blog 🚀

Next.js (App Router), Tailwind CSS v4, Framer Motion で構築された、ターミナル風デザインの個人ブログです。
コマンドプロンプト風の404ページや、スムーズなアニメーション、ダークモード主体のクリーンなデザインが特徴です。

---

## 🚀 はじめに

### 前提条件
- Node.js 18以上
- npm

### インストールと起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
# http://localhost:3000 にアクセス
```

---

## 📝 コンテンツ管理（運営マニュアル）

### 1. 記事の管理 (`content/posts`)

記事は `content/posts` ディレクトリ内の **MDXファイル** として管理されます。

**新しい記事の作成:**
1. `content/posts` 内に `.mdx` ファイルを作成します（例: `my-new-post.mdx`）。
2. ファイルの先頭に以下のようなFrontmatterを記述します：

```yaml
---
title: "記事のタイトル"
date: "2024-03-20"
excerpt: "一覧カードに表示される短い説明文"
coverImage: "/images/blog/cover.jpg" # public/images/blog/ 配下に画像を配置
category: "Tech"
tags: ["Next.js", "Tutorial"]
author: "Admin"
published: true # falseにすると非公開になります
---
```

**本文の執筆とスタイル:**
- 通常のMarkdown記法（見出し、リスト、太字など）が使えます。
- **画像**: `public/images/` に配置し、パスを指定します（例: `/images/my-pic.jpg`）。
- **カスタムコンポーネント**: `MDXComponents.tsx` で許可されたReactコンポーネントを使用可能です。
- **テキスト強調**: `<Text color="red">赤文字</Text>` や `<Text bg="yellow">マーカー</Text>` が使えます。

### 2. My Gearの管理 (`content/my-gear`)

トップページやMy Gearページに表示される愛用品は、`content/my-gear` 内の **MDXファイル** で管理されます。

**新しいアイテムの追加:**
1. `content/my-gear` 内に `.mdx` ファイルを作成します（例: `hhkb.mdx`）。
2. Frontmatterを記述します：

```yaml
---
name: "HHKB Professional Hybrid Type-S"
category: "Keyboard"
image: "/images/gear/hhkb.jpg"
specs:
  "Switch": "Topre Silent"
  "Weight": "45g"
  "Connection": "Bluetooth / USB-C"
---
```
*MDXファイルの本文には、詳細ページに表示される自由記述の紹介文を書くことができます。*

---

## 💻 利用可能なコマンド

### 開発用スクリプト
通常のターミナル（PowerShell, Bashなど）で実行します。

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev` | **開発サーバー起動**（ホットリロード有効） |
| `npm run build` | **本番用ビルド**（`.next` フォルダを作成） |
| `npm run start` | **本番サーバー起動**（ビルド後に実行） |
| `npm run lint` | コードの品質チェックを実行 |

### サイト内ターミナル機能 (404ページ)
404ページ（`app/not-found.tsx`）はインタラクティブなターミナルになっています。訪問者は以下のコマンドを入力できます：

- `help`: コマンド一覧を表示
- `dir` / `ls`: "ファイル"一覧を表示
- `type [ファイル名]` / `cat [ファイル名]`: 隠しファイルを読む（例: `type secret.txt`）
- `whoami`: 現在のユーザー（訪問者）を表示
- `date`: 現在の日時を表示
- `cls` / `clear`: 画面クリア
- `reboot`: グリッチ演出と共にトップページへ戻る

---

## 🎨 デザイン・カスタマイズ詳細ガイド

各ファイルを編集してデザインを変更するための詳細ガイドです。

### 1. グローバル設定（全体の色・フォント）
**ファイル:** [`app/globals.css`](file:///e:/blog/my-terminal-blog/app/globals.css)

このファイルはサイト全体の「テーマ」を定義します。

**変更方法:**
- **色を変える**: `:root`（ライト/ダークモード別）または `@theme` 内の HEXコードを書き換えます。
    - `--primary` (現在の `#7BABFF`)：ボタンやリンクのメインカラー。青系です。
    - `--accent` (現在の `#f59e0b`)：強調色。オレンジ系です。
    - `--background`：背景色。
- **フォントを変える**: `@theme` 内の `--font-line`（本文）や `--font-outfit`（見出し）を変更します。外部フォントを使う場合は、まず `app/layout.tsx` でGoogle Fonts等を読み込む必要があります。

### 2. トップページ: ヒーローセクション
**ファイル:** [`components/Hero.tsx`](file:///e:/blog/my-terminal-blog/components/Hero.tsx)

**コードの意味と変更箇所:**
- **スライドショー画像**: 7行目の `backgroundSlides` 配列。
    ```typescript
    const backgroundSlides = [
      "/images/slideshow/slide1.JPG", // ここを自分の画像のパスに変更
      ...
    ];
    ```
- **アニメーション速度**: 18行目の `setInterval(..., 5000)`。`5000` (ミリ秒) を変更するとスライド切り替え間隔が変わります。
- **メインタイトル**: 50行目付近の `<motion.span>Smart Tech,</motion.span>` を書き換えます。
- **文字が出るアニメーション**: 56行目付近の `transition: { duration: 1.2 }` で1.2秒かけて表示されます。数字を小さくすると速くなります。

### 3. トップページ: オーロラ背景
**ファイル:** [`components/AuroraBackground.tsx`](file:///e:/blog/my-terminal-blog/components/AuroraBackground.tsx)

**コードの意味と変更箇所:**
- **オーロラの色**: 33行目の `var(--aurora)` 定義内。
    ```css
    repeating-linear-gradient(100deg, var(--primary)_10%, var(--accent)_15%, ...)
    ```
    ここの `--primary` や `--accent` を別の色変数（例: `blue` や HEXコード）に変えるとオーロラの色が変わります。
- **動きの速度**: 28行目付近のコメント `I'm sorry but this is what peak performance looks like` の下にあるアニメーション定義の `duration` 相当は Tailwind config で定義されていますが、色はここで直接いじれます。

### 4. 404ページ（ターミナル）
**ファイル:** [`app/not-found.tsx`](file:///e:/blog/my-terminal-blog/app/not-found.tsx)

**コードの意味と変更箇所:**
- **メッセージの変更**: 15行目の `COMMANDS` オブジェクト。
    - `help`: ヘルプの文章を変えられます。
    - `whoami`: 表示されるユーザー名を変えられます。
- **隠しファイル**: 33行目の `SECRET_FILES` オブジェクト。
    - `'secret.txt': 'Message'` のように追加すると、`type secret.txt` で読めるファイルが増やせます。
- **背景色**: 146行目の `bg-gradient-to-br from-[#0f172a]...`。このHEXコードを変えると、ターミナルの背景グラデーションが変わります。
- **ウィンドウの色**: 201行目の `bg-[#0c0c0c]`。ここを黒以外にするとターミナル画面の色が変わります。

### 5. 記事の表示デザイン
**ファイル:** [`components/MDXComponents.tsx`](file:///e:/blog/my-terminal-blog/components/MDXComponents.tsx)

このファイルは、ブログ記事内の Markdown 要素（見出しや段落）がどう表示されるかを決めています。

**コードの意味と変更箇所:**
- **H1 (大見出し)**: 33行目の `H1` コンポーネント。
    - `border-b-4 border-primary/20`: 下線の太さと色。`/20` は透明度20%を意味します。
- **H2 (中見出し)**: 44行目の `H2` コンポーネント。
    - `<div className="w-1.5 h-6 bg-primary rounded-full" />`: 見出しの左にある「棒」のデザインです。`bg-primary` を `bg-red-500` にすれば赤くなります。
- **テキスト装飾**: 5行目の `Text` コンポーネント。Markdown内で `<Text color="red">` と書いたときの挙動を定義しています。

### 6. ヘッダーとフッター
**ヘッダー:** [`components/Header.tsx`](file:///e:/blog/my-terminal-blog/components/Header.tsx)
- ロゴの文字や、ナビゲーションメニューのリンク先を変更できます。
- `<Link href="/about">` の `/about` を書き換えるとリンク先が変わります。

**フッター:** [`components/Footer.tsx`](file:///e:/blog/my-terminal-blog/components/Footer.tsx)
- コピーライトの年号や、SNSアイコンのリンク先を変更できます。
- アイコンは `lucide-react` や `FontAwesome` を使っています。

---

### デプロイ（公開）
**プラットフォーム:** Vercel (推奨)
1. GitHubにコードをプッシュします。
2. Vercelでリポジトリをインポートします。
3. Framework Preset: Next.js (自動判定)。
4. Deployボタンを押します。

---

### プロジェクト構成図
```
.
├── app/                  # ページとルーティング
│   ├── globals.css       # グローバルスタイル (Tailwindテーマ)
│   ├── layout.tsx        # 共通レイアウトとプロバイダー
│   ├── page.tsx          # トップページ
│   └── not-found.tsx     # 404 ターミナルページ
├── components/           # UIコンポーネント (Header, Heroなど)
├── content/              # MDXデータ (記事, Gear)
├── public/               # 画像ファイル (/images/... でアクセス)
└── lib/                  # ユーティリティ関数
```

### URL
xyzack271.com 2025.12.26 更新
ビルドテスト
