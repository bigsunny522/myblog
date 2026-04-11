import { defineConfig } from 'tinacms';

export default defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  branch:
    process.env.GITHUB_BRANCH ||
    process.env.CF_PAGES_BRANCH ||
    'main',

  build: {
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
            ui: { component: 'textarea' },
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
            templates: [
              // ─── スペック表 ───────────────────────────────────────
              {
                name: 'Specs',
                label: 'スペック表',
                fields: [
                  {
                    name: 'items',
                    label: 'スペック項目',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item: { label?: string }) => ({
                        label: item?.label ?? 'スペック項目',
                      }),
                    },
                    fields: [
                      { name: 'label', label: 'ラベル', type: 'string', required: true },
                      { name: 'value', label: '値', type: 'string', required: true },
                    ],
                  },
                ],
              },

              // ─── 購入リンク ───────────────────────────────────────
              {
                name: 'BuyLinks',
                label: '購入リンク',
                fields: [
                  { name: 'title', label: '商品名', type: 'string' },
                  { name: 'image', label: '商品画像 URL', type: 'string' },
                  { name: 'description', label: '商品説明', type: 'string' },
                  {
                    name: 'links',
                    label: 'リンク一覧',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item: { label?: string; type?: string }) => ({
                        label: item?.label ?? item?.type ?? 'リンク',
                      }),
                    },
                    fields: [
                      {
                        name: 'type',
                        label: '種類',
                        type: 'string',
                        options: [
                          { value: 'amazon', label: 'Amazon' },
                          { value: 'rakuten', label: '楽天市場' },
                          { value: 'official', label: '公式サイト' },
                        ],
                      },
                      { name: 'href', label: 'URL', type: 'string', required: true },
                      { name: 'label', label: 'ボタンテキスト', type: 'string' },
                    ],
                  },
                ],
              },

              // ─── 特徴ポイント ─────────────────────────────────────
              {
                name: 'FeaturePoint',
                label: '特徴ポイント',
                fields: [
                  { name: 'number', label: '番号', type: 'number', required: true },
                  { name: 'title', label: 'タイトル', type: 'string', required: true },
                  { name: 'body', label: '本文', type: 'rich-text' },
                ],
              },

              // ─── レビューまとめ ───────────────────────────────────
              {
                name: 'ReviewSummary',
                label: 'レビューまとめ（良い点 / 気になる点）',
                fields: [
                  {
                    name: 'goodPoints',
                    label: 'GOOD（良い点）',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item: { title?: string }) => ({
                        label: item?.title ?? 'GOOD',
                      }),
                    },
                    fields: [
                      { name: 'title', label: 'タイトル', type: 'string', required: true },
                      { name: 'body', label: '説明', type: 'string' },
                    ],
                  },
                  {
                    name: 'conPoints',
                    label: '気になる点',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item: { title?: string }) => ({
                        label: item?.title ?? '気になる点',
                      }),
                    },
                    fields: [
                      { name: 'title', label: 'タイトル', type: 'string', required: true },
                      { name: 'body', label: '説明', type: 'string' },
                    ],
                  },
                ],
              },

              // ─── クーポン ─────────────────────────────────────────
              {
                name: 'CouponBox',
                label: 'クーポン情報',
                fields: [
                  { name: 'body', label: '内容', type: 'rich-text' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
