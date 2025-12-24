# サイト運営マニュアル

このドキュメントでは、GadgetLog（当ブログ）の日常的な運営方法について解説します。

## 1. 記事の追加・更新方法

記事は `content/posts` フォルダ内のMDXファイルとして管理されています。
新しい記事を追加するには、以下の手順を行ってください。

### 新規記事の作成
1. `content/posts` フォルダ内に新しいファイルを作成します（例: `new-review.mdx`）。
2. ファイルの先頭に以下のメタデータ（Frontmatter）を記述します。

```markdown
---
title: "記事のタイトル"
date: "2024-03-20"
excerpt: "記事の短い要約文（一覧ページやカードに表示されます）"
coverImage: "https://images.unsplash.com/photo-..."
category: "Review"
tags: ["Gadget", "Audio"]
author: "Admin"
---

ここから本文をMarkdown形式で記述します...
```

### 重要な項目
- **coverImage**: 記事のサムネイル画像のURLを指定します（UnsplashなどのURLや、`public`フォルダ内のパス）。
- **category**: `Review`, `News`, `Tech` など、記事のカテゴリーを指定します。
- **tags**: 関連するタグを配列形式 `["Tag1", "Tag2"]` で記述します。

### 記事への画像挿入
記事本文に画像を挿入したい場合は、以下の手順で行います。

1. **画像の準備**: 使用したい画像を `public/images` フォルダ内に保存します（フォルダがない場合は作成してください）。
2. **Markdownでの記述**: 記事ファイル（.mdx）内で、以下のように記述します。

```markdown
![画像の説明](/images/ファイル名.jpg)
```

⚠️ 注意: `public` フォルダはURLのルート（`/`）に対応します。`public/images/photo.jpg` に置いた場合、パスは `/images/photo.jpg` となります。

### テキストの装飾
記事内でテキストを装飾する方法は以下の通りです。

#### 基本的な装飾
- **太字**: `**強調したい文字**`
- **斜体**: `*斜体にしたい文字*`
- **下線**: `<u>下線を引きたい文字</u>`
- **打ち消し線**: `~~打ち消したい文字~~`

#### 色や背景色の変更（カスタム機能）
専用の `<Text>` タグを使用することで、文字色や背景色を自由に変更できます。

```jsx
<Text color="red">赤色の文字</Text>
<Text color="#00ff00">カラーコードも使用可能</Text>
<Text bg="yellow">マーカー風の背景</Text>
<Text className="text-xl font-bold">サイズ変更（Tailwindクラス）</Text>
```



### 目次の自動生成
記事内の見出し（`#` ～ `###`）から、自動的に目次が生成されます。
特別な設定は不要です。記事内で見出しを記述するだけで、記事の冒頭にアコーディオン式の目次が表示されます。
- `#` (H1) ～ `###` (H3) が抽出対象です。
- 目次はクリックで開閉可能です。

## 2. My Gear（愛用品紹介）の更新方法

トップページの「My Gear」セクションに表示されるアイテムは、プログラムファイル内で管理されています。

### アイテムの追加・編集
1. `lib/gear.ts` ファイルを開きます。
2. `gearItems` という配列の中に、新しいアイテムのデータを追加します。

```typescript
{
  id: 'unique-id', // 他と被らないID
  name: 'アイテム名',
  category: 'カテゴリー（例: Audio）',
  image: '画像のURL',
  description: '紹介文',
  specs: {
    '項目名': 'スペック内容',
    'バッテリー': '30時間',
    // 必要に応じて項目を追加できます
  }
},
```

## 3. サイト設定の変更（上級）

### フッターアイコンの変更
`components/Footer.tsx` を編集します。`FontAwesomeIcon` を使用しています。
新しいアイコンを使う場合は、アイコンパッケージからインポートする必要があります。

### ヒーロー画像の変更
`components/Hero.tsx` 内の `backgroundSlides` 配列にある画像URLを変更することで、トップページのスライドショー画像を変更できます。

## 4. サイトの公開（デプロイ）について

このサイトは Vercel などのホスティングサービスへのデプロイ（公開）に適した構成になっています。
GitHub等のリポジトリにコードをプッシュし、Vercelと連携させることで、自動的にインターネット上に公開できます。
Deployment Guide: [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
