---
name: new-post
description: content/ideas/ からネタを選んで新しい記事の執筆を始める。ブランチ作成・テンプレートからの下書き生成・画像フォルダ作成までを行う。「新しい記事を書きたい」「/new-post」「ネタから記事を書き始めて」と言われたら使う。
tools: Read, Write, Edit, Glob, Grep, Bash
---

# /new-post

`content/ideas/` のネタバックログから記事執筆を開始する。ブランチ作成 → テンプレートから `content/drafts/` に雛形生成 → 画像フォルダ作成、までを行う。実際の執筆(本文作成)はこのスキルの後の会話で行う。

引数でネタファイル名やスラッグを直接指定してもよい(例: `/new-post satray-mobilebattery-review`)。指定がなければ手順1でネタを選ぶ。

## 手順

### 1. ネタを選ぶ

```bash
ls content/ideas/*.md
```

`README.md` と `TEMPLATE.md` を除いた `.md` ファイルの frontmatter(`status`)を確認し、`status: todo` のものを一覧表示してユーザーに選んでもらう。ユーザーが特定のネタや、ideas に存在しない新規テーマを直接指定した場合はそれに従う。

該当ネタがない場合は、ユーザーから直接タイトル・スラッグ・記事タイプを聞く。

### 2. スラッグを決める

英数字とハイフンのみ(`^[a-zA-Z0-9-]+$`)。**このスラッグが記事URL・画像フォルダ名になるため、書き始める前に確定させる**(後から変更すると `public/images/posts/<slug>/` との不一致が起きる)。

### 3. 記事タイプを決める

- 製品購入・PR提供品のレビュー → `templates/review-post.mdx`
- ニュース・イベントレポート・まとめ → `templates/news-post.mdx`

迷う場合はユーザーに聞く。

### 4. ブランチを作成する

作業ツリーが汚れていないか確認してから、最新の `main` を起点にブランチを作る(CLAUDE.md の Git ワークフロー参照)。

```bash
git status --porcelain   # 未コミットの変更がないか確認。あれば中断してユーザーに確認
git fetch origin main
git checkout -b post/<slug> origin/main
```

### 5. テンプレートから下書きを生成する

```bash
cp templates/review-post.mdx content/drafts/<slug>.mdx   # または news-post.mdx
mkdir -p public/images/posts/<slug>/
```

`content/drafts/<slug>.mdx` 内の `<slug>` プレースホルダー(`coverImage` や画像パス)を実際のスラッグに置換する。ネタファイルに `title` / `keywords` / `referenceUrls` があれば、わかる範囲でフロントマターに反映する(`category` / `tags` は必ず `content/data/taxonomy.json` に存在する値から選ぶ。新しい値が必要なら先に taxonomy.json に追加する)。

### 6. ネタのステータスを更新する

対応する `content/ideas/<idea>.md` があれば `status: in-progress` に更新する。

### 7. 執筆ガイドを読み込む

以降の執筆で参照するため、`docs/writing-guide.md`(構成・公開前チェックリスト・文章表現の注意点)と `docs/components.md`(コンポーネントカタログ)を読んでおく。

### 8. 初期スキャフォールドをコミットする

```bash
git add content/drafts/<slug>.mdx content/ideas/<idea>.md
git commit -m "start draft: <slug>"
```

### 9. 完了報告

ブランチ名・下書きファイルパス(`content/drafts/<slug>.mdx`)・画像フォルダパス(`public/images/posts/<slug>/`)をユーザーに伝え、次のステップ(本文執筆 → 画像配置 → `/publish`)を案内する。
