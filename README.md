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

## 🎨 デザイン・カスタマイズガイド

サイトのデザインやパラメータを変更する場所をまとめています。

### 1. 全体テーマ（色・フォント）
**ファイル:** `app/globals.css`
このプロジェクトは **Tailwind CSS v4** を使用しています。テーマ変数は `@theme` ブロックと `:root` で定義されています。

- **色 (Colors)**: `:root`（ライト/ダークモード用変数）または `@theme` を直接編集します。
  - `--primary`: メインのアクセントカラー。
  - `--background` / `--foreground`: 背景色と文字色。
- **フォント (Fonts)**: `@theme` ブロック内で定義されています。
  - `--font-line`: 本文フォント (LINE Seed JP)。
  - `--font-outfit`: 見出しフォント (Outfit)。

### 2. レイアウト・共通要素
| コンポーネント | ファイルパス | カスタマイズ内容 |
| :--- | :--- | :--- |
| **ヘッダー** | `components/Header.tsx` | ロゴのテキスト、ナビゲーションリンク、「Menu」ボタンのデザイン。 |
| **フッター** | `components/Footer.tsx` | コピーライトのテキスト、SNSリンク (Twitter/GitHub等のURL)、フッターリンク。 |
| **背景** | `components/AuroraBackground.tsx` | オーロラグラデーションのアニメーション色や速度。 |

### 3. ページ別デザイン設定
| セクション | ファイルパス | 変更できるパラメータ |
| :--- | :--- | :--- |
| **ヒーロー (Top)** | `components/Hero.tsx` | メインタイトル (`<h1>`)、サブテキスト (`<p>`)、スライドショー画像 (`backgroundSlides` 配列)、アニメーション速度。 |
| **記事一覧** | `components/BlogList.tsx` | カードのレイアウト、グリッド列数 (`grid-cols-1 md:grid-cols-2` 等)、ホバーエフェクト。 |
| **Homeタブ** | `components/HomePostTabs.tsx` | "Latest" / "Recommended" タブのラベルや挙動。 |
| **My Gear (Home)**| `components/GearSection.tsx` | セクションタイトル、表示件数、"View More" ボタン。 |
| **My Gear (Page)**| `components/GearPageClient.tsx` | フィルタリングのロジック、詳細ページのグリッドレイアウト。 |
| **404ターミナル** | `app/not-found.tsx` | プロンプトのテキスト、`COMMANDS` の応答テキスト、`SECRET_FILES` の中身、グリッチの色。 |

### 4. 記事のデザイン (MDX)
**ファイル:** `components/MDXComponents.tsx`
- 標準的なMarkdown要素（H1, H2, P, リンクなど）の見た目を定義しています。
- ブログ記事全体のデフォルトスタイルを変更したい場合はこのファイルを編集します。
- 例: 全記事のリンク色を変えたい場合は、ここにある `a` コンポーネントを変更します。

### 5. デプロイ
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
