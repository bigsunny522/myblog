import { defineConfig } from 'tinacms';

export default defineConfig({
  // TinaCloud認証情報（app.tina.io で取得・Cloudflare Pages環境変数に設定）
  // 未設定の場合はローカルモードで動作
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  branch:
    process.env.GITHUB_BRANCH ||
    process.env.CF_PAGES_BRANCH || // Cloudflare Pages の自動環境変数
    'main',

  build: {
    // 管理UIを public/admin/ に出力 → Cloudflare Pages で /admin として配信
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'post',
        label: '記事',
        path: 'content/posts',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'タイトル',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'subtitle',
            label: 'サブタイトル',
          },
          {
            type: 'string',
            name: 'excerpt',
            label: '概要',
            ui: {
              component: 'textarea',
            },
            required: true,
          },
          {
            type: 'string',
            name: 'date',
            label: '公開日（YYYY-MM-DD）',
            required: true,
          },
          {
            type: 'string',
            name: 'category',
            label: 'カテゴリ',
            required: true,
          },
          {
            type: 'string',
            name: 'tags',
            label: 'タグ',
            list: true,
          },
          {
            type: 'string',
            name: 'coverImage',
            label: 'カバー画像 URL',
          },
          {
            type: 'boolean',
            name: 'recommended',
            label: 'おすすめ記事',
          },
          {
            type: 'boolean',
            name: 'published',
            label: '公開する',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: '本文',
            isBody: true,
          },
        ],
      },
    ],
  },
});
