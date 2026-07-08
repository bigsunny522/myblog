# content/drafts/

書きかけ記事の置き場所。`lib/mdx.ts` は `content/posts/*.mdx` しか読まないため、このフォルダに置いたファイルはビルド対象外 = **誤って公開されることが構造的に起きない**。

**公開 = このフォルダから `content/posts/` へファイルを移動すること**、と定義する。

## ワークフロー

1. `/new-post` スキルがテンプレート(`templates/review-post.mdx` or `templates/news-post.mdx`)からこのフォルダに雛形を生成する
2. 執筆中はここで編集する(`published` フロントマターの値は無視される。ビルド対象外のため)
3. 書き終えたら `/publish` スキルを実行する。`date` の更新・`published: true` 化・`content/posts/` への移動・`npm run check:posts` の検証・WEBPキャッシュ生成・PR作成までを行う

## 注意

- `npm run check:posts` はこのフォルダを検査しない(`content/posts/` のみ対象)。下書き段階の未完成なフロントマターはチェックされないので、`/publish` 実行時に初めて検証される
- ファイル名(`<slug>.mdx`)は最終的な記事URLになる。後から変更すると画像フォルダ名 (`public/images/posts/<slug>/`) との不一致が起きるので、書き始める前に確定させる
