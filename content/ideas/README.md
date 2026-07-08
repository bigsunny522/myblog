# content/ideas/

記事ネタのバックログ。1ネタ1ファイル(`.md`)。`content/posts/` や `content/drafts/` とは異なりビルド対象外で、`/new-post` スキルの起点として使う。

## ファイル形式

`TEMPLATE.md` をコピーして `<slug候補>.md` などの名前で保存する。

```yaml
---
title: "" # 製品名・ネタのタイトル
keywords: [] # 記事で扱いたい検索キーワード
referenceUrls: [] # 参考URL(製品公式ページ、比較記事、プレスリリースなど)
priority: "medium" # high / medium / low
status: "todo" # todo(未着手) / in-progress(執筆中) / done(公開済み) / skipped(見送り)
---

背景・企画意図・PR提供品かどうか・締切などの自由記述メモ。
```

## ステータスの扱い

- `todo`: `/new-post` の選定候補
- `in-progress`: `/new-post` でブランチと下書きを作成した後に更新する
- `done`: `/publish` で記事を公開した後に更新する
- `skipped`: ネタとして見送った場合(削除せず理由を残す)

## 関連

- 下書きの置き場所: [content/drafts/](../drafts/)
- 執筆ガイド: [docs/writing-guide.md](../../docs/writing-guide.md)
- スキル: `.claude/skills/new-post/`, `.claude/skills/publish/`
