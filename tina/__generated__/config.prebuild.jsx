// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  // TinaCloud認証情報（app.tina.io で取得・Cloudflare Pages環境変数に設定）
  // 未設定の場合はローカルモードで動作
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "",
  token: process.env.TINA_TOKEN ?? "",
  branch: process.env.GITHUB_BRANCH || process.env.CF_PAGES_BRANCH || // Cloudflare Pages の自動環境変数
  "main",
  build: {
    // 管理UIを public/admin/ に出力 → Cloudflare Pages で /admin として配信
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "\u8A18\u4E8B",
        path: "content/posts",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "\u30BF\u30A4\u30C8\u30EB",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "subtitle",
            label: "\u30B5\u30D6\u30BF\u30A4\u30C8\u30EB"
          },
          {
            type: "string",
            name: "excerpt",
            label: "\u6982\u8981",
            ui: {
              component: "textarea"
            },
            required: true
          },
          {
            type: "string",
            name: "date",
            label: "\u516C\u958B\u65E5\uFF08YYYY-MM-DD\uFF09",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "\u30AB\u30C6\u30B4\u30EA",
            required: true
          },
          {
            type: "string",
            name: "tags",
            label: "\u30BF\u30B0",
            list: true
          },
          {
            type: "string",
            name: "coverImage",
            label: "\u30AB\u30D0\u30FC\u753B\u50CF URL"
          },
          {
            type: "boolean",
            name: "recommended",
            label: "\u304A\u3059\u3059\u3081\u8A18\u4E8B"
          },
          {
            type: "boolean",
            name: "published",
            label: "\u516C\u958B\u3059\u308B"
          },
          {
            type: "rich-text",
            name: "body",
            label: "\u672C\u6587",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
