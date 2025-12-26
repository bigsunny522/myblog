# 公開・非公開切り替え機能の実装 (Visibility Toggle Implementation)

## 概要
ブログ記事 (`content/posts/*.mdx`) およびギア紹介 (`content/my-gear/*.mdx`) に対して、公開・非公開を制御する機能を追加しました。
Frontmatter に `published: false` を記述することで、そのコンテンツをサイト上から非表示にできます。
デフォルト（記述なし、または `published: true`）の場合は表示されます。

## 変更内容

### 1. `lib/mdx.ts`
- `BlogPost` インターフェースに `published?: boolean` を追加。
- `getPostBySlug` 関数で Frontmatter の `published` 値を取得し、未定義の場合は `true` とするように実装。
- `getAllPosts` 関数で `published` が `false` の記事を除外するフィルタリング処理を追加。

### 2. `lib/gear.ts`
- `GearItem` インターフェースに `published?: boolean` を追加。

### 3. `lib/gear-data.ts`
- `getAllGearItems` 関数で Frontmatter の `published` 値を取得し、未定義の場合は `true` とするように実装。
- `published` が `false` のアイテムを除外するフィルタリング処理を追加。

## 使用方法

### ブログ記事を非公開にする
`content/posts/` 配下の `.mdx` ファイルの Frontmatter に以下を追加します。

```yaml
---
title: "記事タイトル"
date: "2025-12-26"
published: false
---
```

### ギアを非公開にする
`content/my-gear/` 配下の `.mdx` ファイルの Frontmatter に以下を追加します。

```yaml
---
name: "機材名"
category: "camera"
published: false
---
```

これらの記述を削除するか `published: true` に変更すれば、再度公開されます。
