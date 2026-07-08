---
name: publish
description: content/drafts/ の下書き記事を公開する。frontmatterの更新・機械検品・WEBPキャッシュ生成・content/posts/への移動・PR作成までを行う。「記事を公開して」「/publish」「下書きをpostsに移動して」と言われたら使う。
tools: Read, Write, Edit, Glob, Grep, Bash
---

# /publish

`content/drafts/<slug>.mdx` を `content/posts/` へ公開する。**マージは行わない** — PR作成までがこのスキルの範囲(main へのマージは明示的な指示があった時のみ、という CLAUDE.md の Git ワークフローに従う)。

引数でスラッグを指定する(例: `/publish satray-mobilebattery-review`)。指定がなければ現在のブランチ名(`post/<slug>`)から推測するか、`content/drafts/*.mdx` を一覧してユーザーに選んでもらう。

## 手順

### 1. 対象ファイルを確認する

```bash
ls content/drafts/<slug>.mdx
```

存在しない場合は中断してユーザーに確認する。

### 2. 画像が揃っているか確認する

`public/images/posts/<slug>/` に `coverImage` と本文中で参照している画像がすべて存在するか確認する(`npm run check:posts` でも後述の手順5で機械チェックされるが、先に目視確認しておくと手戻りが少ない)。元画像が7〜10MBを超える場合は `npm run optimize:images -- posts/<slug>` で圧縮する(CLAUDE.md の画像運用ルール参照)。

### 3. フロントマターを更新する

- `date` を **main にマージ(公開)する予定日**に更新する(通常は今日の日付)
- `published: true` に変更する
- `excerpt` / `coverImage` / レビュー記事なら `rating`(可能なら `price` / `faqs`)が埋まっているか確認する
- `category` / `tags` が `content/data/taxonomy.json` に存在する値のみになっているか確認する

### 4. 校正する(proofreaderサブエージェント)

Agent tool で `proofreader` サブエージェントを呼び、記事を校正する。読み取り専用で指摘のみ返すエージェントなので、指摘内容を確認してから自分(メインの会話)で修正を反映する。指摘が無ければそのまま次に進む。

レビュー記事でスペック・価格・対応規格を確認したい場合は、必要に応じて `fact-checker` サブエージェント(WebSearch可)も併用する。

### 5. drafts から posts へ移動する

```bash
git mv content/drafts/<slug>.mdx content/posts/<slug>.mdx
```

### 6. 機械検品を実行する

```bash
npm run check:posts
```

`published: true` の記事はエラーが非ゼロ終了の対象になる。エラーが出た場合は該当箇所を修正し、通るまで再実行する。

### 7. ビルドしてWEBPキャッシュを生成する

`npm run build` はそのまま実行すると最後に IndexNow への ping(`scripts/ping-indexnow.mjs`)まで行ってしまうため、**ローカル検証ではこのステップだけ分解して実行する**(CLAUDE.md 参照)。

```bash
( test -z "$NEXT_PUBLIC_TINA_CLIENT_ID" || tinacms build || true )
npx next build
node scripts/setup-image-cache.mjs
npx next-image-export-optimizer
node scripts/generate-sitemap.mjs
# ping-indexnow.mjs はローカルでは実行しない
```

生成された `public/images/posts/<slug>/nextImageExportOptimizer/*.WEBP` と、更新された `public/images/next-image-export-optimizer-hashes.json` を後でコミットする。

### 8. ネタのステータスを更新する

対応する `content/ideas/<idea>.md` があれば `status: done` に更新する。

### 9. コミットする

```bash
git add content/posts/<slug>.mdx public/images/posts/<slug>/ public/images/next-image-export-optimizer-hashes.json public/sitemap.xml content/ideas/<idea>.md
git commit -m "publish: <slug>"
```

`public/sitemap.xml` は `next build` の静的エクスポート成果物であり `out/` 配下のみに出るため、リポジトリ管理下の `public/` 側に変更がなければ `git add` の対象から外してよい(実際に差分が出たファイルだけをコミットする)。

### 10. プッシュしてPRを作成する

```bash
git push -u origin post/<slug>
gh pr create --base main --head post/<slug> --title "<記事タイトル>" --body "..."
```

PR作成後、URLをユーザーに伝えて終了する。**マージは行わない。** ユーザーが内容を確認してから別途マージを指示する。
