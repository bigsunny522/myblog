# ブログ自律運用化 改善計画(優先度順)

> 作成: 2026-07-08 / Claude Code のセッションでの現状分析に基づく実装計画。
> **目的**: Claude Code が自律的に記事を生成・公開できるよう、リポジトリ構成と Claude Code 側の仕組みを整備する。
> **原則**: エージェントが既存記事から空気を察するのではなく、機械可読な規約・データ・手順を参照して動き、間違いは機械が弾く状態にすること。

## 進め方

- Phase 順に実施する。**Phase 1〜2 を先に完了させること**。以降の変更はすべて validate に守られた状態で行う
- 必ずフィーチャーブランチで作業する(`fix/<name>` / `feat/<name>`)。main へ直接コミット・push しない(CLAUDE.md の Git ワークフロー参照)
- 各 Phase は独立した PR に分けてよい

---

## Phase 1: 既存の矛盾・危険の解消(最優先・小規模)

### 1-1. `AI_INSTRUCTIONS.md` の削除

ルート直下のこのファイルの中身は「動作が確認できたのでメインにマージしてください」の1行のみ(過去セッションの置き土産)。ファイル名的に AI への恒常指示に見え、自律動作中のエージェントが「main にマージせよ」と誤読するリスクがある。CLAUDE.md の「main への push は明示指示のみ」という規約とも矛盾するため削除する。

### 1-2. `.claude/settings.local.json` の旧ドライブパス修正

リポジトリは以前 `E:\blog\my-terminal-blog` にあり、現在は `G:\blog\my-terminal-blog`。以下が旧パスのまま残っている:

- PostToolUse hook(git commit 検出時に技術サマリー更新を促すもの)が `C:/Users/eotw0/.claude/projects/E--blog-my-terminal-blog/memory/project_tech_summary.md` を指している → 正しくは `G--blog-my-terminal-blog`。実ファイルは正しい場所に存在するので hook 側のパスだけ直す
- permissions 内の `Bash(ls "E:/blog/...")` など E: 参照のエントリ → 削除または G: に修正

### 1-3. 画像フォルダ名とスラッグの統一

規約(CLAUDE.md)は `public/images/posts/<記事スラッグ>/` だが、実態が不一致。フォルダをスラッグ名にリネームし、各記事の `coverImage` と本文中の画像パスを一括更新する:

| 現在のフォルダ | リネーム後(=記事スラッグ) |
|---|---|
| `public/images/posts/satray-battery` | `satray-mobilebattery-review` |
| `public/images/posts/benq-screenbar` | `benq-screenbar-halo2-review` |
| `public/images/posts/wwdc26` | `wwdc26-summary` |

- `dell-aw2725q-oled-review.mdx` と `edifire-w60-review.mdx`(いずれも未公開下書き)は参照先フォルダ自体が存在しない参照切れ。公開時に画像を用意する必要がある(今は放置でよいが把握しておく)
- **注意**: `public/images/**/nextImageExportOptimizer/*.WEBP` のキャッシュもパスに紐づくため、リネーム後にローカルで `npm run build` を実行して WEBP を再生成・コミットすること(CLAUDE.md の画像運用ルール参照)

### 1-4. カバー画像の置き場所の一本化

現状 `/images/posts/<slug>/`、`/images/cover/`、`/images/main/`、Unsplash 外部 URL の4通りが混在。新規記事は `/images/posts/<slug>/cover.jpg` に統一する方針を CLAUDE.md に明記する(外部 URL は画像最適化パイプラインを素通りするため非推奨と書く)。既存記事の移行は必須ではない。

---

## Phase 2: 機械検品の基盤(以降の全変更の安全網)

### 2-1. `scripts/validate-posts.mjs` の新規作成 + `npm run check:posts`

`content/posts/*.mdx` 全件に対して以下を検証し、違反をファイル名・行付きで報告して非ゼロ終了する:

- フロントマター必須項目(title / excerpt / date が `YYYY-MM-DD` 形式 / category / coverImage)
- スラッグが英数字・ハイフンのみ
- `coverImage` と本文中の画像参照(`![...](...)`, `<Figure>`, `<ImageGrid>` 等)の実ファイル存在チェック
- 対応する WEBP キャッシュ(`nextImageExportOptimizer/`)のコミット漏れ検出
- CommonMark の太字崩れ lint: `**...」**` や `**...）**` のように閉じ `**` が閉じ括弧に隣接し、直後が空白でも句読点でもない通常文字のパターンを検出(CLAUDE.md「文章表現の注意点」参照)
- タグ・カテゴリが 2-2 のマスターに存在するか

### 2-2. `content/data/taxonomy.json` の新規作成

カテゴリと公認タグのマスター定義。現状タグは記事ごとの自由記述で表記ゆれがあり、`/tags/[tag]` ページの乱造につながる。既存記事の全タグを棚卸しして初期マスターを作り、validate で「マスターにないタグはエラー」にする。

---

## Phase 3: 生成物の品質安定化

### 3-1. `templates/` の新規作成

- `templates/review-post.mdx`: レビュー記事雛形。フロントマター(rating / price / faqs 含む)+ 標準構成(導入 → `<BuyLinks>` → `<Specs>` + `<FeaturePoint>`×2〜3 → 開封・外観 `<ImageGrid>` → 使用感 → `<ReviewSummary>` → 総評)をコメント付きで
- `templates/news-post.mdx`: ニュース・まとめ記事用の簡易版

### 3-2. 執筆ナレッジの切り出し(CLAUDE.md を薄く)

CLAUDE.md の執筆関連セクション(記事執筆の要点・文章表現の注意点・コンポーネント一覧)を独立ファイルに移し、CLAUDE.md にはポインタだけ残す。置き場所は Phase 4 のスキル付属リソースが第一候補(執筆時のみロードされる)。内容:

- `writing-guide.md`: 文体・構成・NG 表現
- `components.md`: 全 MDX カスタムコンポーネントの実使用例カタログ(実装は `components/MDXComponents.tsx`。現状 `content/posts/test.mdx` が事実上カタログ代わりになっている)

### 3-3. コンテンツ・リポジトリの掃除

- `content/posts/test.mdx` → 削除するか `content/_fixtures/` へ隔離(3-2 のカタログに役割を移す)
- ルート直下の `image.png` → 削除または適切な場所へ
- `public/images/cover/*.af`(Affinity デザイン元ファイル)→ `public/` 外(例 `assets-src/`)へ移動。配信不要物がデプロイに含まれている
- マージ済みの `claude/*` ブランチ(17本程度)と `.claude/worktrees/` の残骸(5件)を削除

---

## Phase 4: ワークフローの自律化(Skills / Agents / Hooks / Memory)

### 4-1. 執筆パイプラインのフォルダ化

- `content/ideas/`: ネタのバックログ。1ネタ1ファイル、フロントマターに製品名・キーワード・参考URL・優先度・status。自律執筆の起点
- `content/drafts/`: 書きかけ記事。`lib/mdx.ts` は `content/posts/` しか読まないため、drafts はビルド対象外 = 誤公開が構造的に起きない。**公開 = drafts から posts への移動**、と定義する

### 4-2. プロジェクトスキル(`.claude/skills/`)の作成

- `/new-post`: `content/ideas/` からネタ選定 → `post/<slug>` ブランチ作成 → テンプレートから drafts に雛形生成 → `public/images/posts/<slug>/` 作成。writing-guide.md / components.md を付属リソースとして同梱
- `/publish`: `npm run check:posts` 実行 → `date` を当日(マージ予定日)に更新 → `published: true` → ローカル `npm run build` で WEBP 生成・コミット → drafts から posts へ移動 → PR 作成
- `/import-photos`: 写真の取り込み → リネーム → `npm run optimize:images -- posts/<slug>` で圧縮 → 配置 → `<ImageGrid>` スニペット生成

### 4-3. サブエージェント(`.claude/agents/`)の定義

- `proofreader`: 読み取り専用ツールのみ。校正専任(誤字・冗長表現・太字括弧問題・`()` 多用・スペーサー重複)。`/publish` の手順から呼ぶ。独立コンテキストなので執筆時の思い込みを引きずらない
- `fact-checker`: WebSearch 可。レビュー記事のスペック数値・価格・対応規格を公式ソースと突き合わせる(PR 提供品レビューでのスペック誤記防止)

### 4-4. Hooks による決定論的な強制

PostToolUse hook(matcher: Edit/Write、対象 `content/posts/**` と `content/drafts/**`)で該当ファイルに validate を実行し、違反を即フィードバック。文章で「守れ」と書くより確実。

### 4-5. 設定の共有化

`.claude/settings.local.json` の有効な設定を `.claude/settings.json` に昇格してコミット(worktree・別マシン・クラウド実行でも同じ挙動にする)。

### Memory の運用方針(実装物ではなく方針)

文体規約・構成ルールは必ずリポジトリ側(スキル/docs)に置く。メモリはバージョン管理されず環境に紐づくため、以下に限定する:

- ユーザーからの修正フィードバックの蓄積(feedback)
- 外部との約束事 — 提供品レビューの公開期日等(project)
- ユーザーの働き方の好み(user)

---

## Phase 5: CI(最終安全網)

### 5-1. `.github/workflows/validate.yml` の新規作成

現状 CI なし。PR 時に `npm run check:posts` + `npm run build` を実行する。これが通れば人間はマージボタンを押すだけの承認者に回れる。デプロイは Cloudflare Pages 側にあるため、ここでは検証のみ。

---

## 共通の注意事項

- 画像パスを変更した場合は WEBP キャッシュの再生成・コミットを忘れない(怠ると Cloudflare Pages のビルドが数分余計にかかる)
- `tina/__generated__/` は自動生成なので手動編集しない
- IndexNow への ping(`ping-indexnow.mjs`)はローカル検証では実行しない
