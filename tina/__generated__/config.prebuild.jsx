// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "",
  token: process.env.TINA_TOKEN ?? "",
  branch: process.env.GITHUB_BRANCH || process.env.CF_PAGES_BRANCH || "main",
  build: {
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
            ui: { component: "textarea" },
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
            isBody: true,
            templates: [
              // ─── スペック表 ───────────────────────────────────────
              {
                name: "Specs",
                label: "\u30B9\u30DA\u30C3\u30AF\u8868",
                fields: [
                  {
                    name: "items",
                    label: "\u30B9\u30DA\u30C3\u30AF\u9805\u76EE",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => ({
                        label: item?.label ?? "\u30B9\u30DA\u30C3\u30AF\u9805\u76EE"
                      })
                    },
                    fields: [
                      { name: "label", label: "\u30E9\u30D9\u30EB", type: "string", required: true },
                      { name: "value", label: "\u5024", type: "string", required: true }
                    ]
                  }
                ]
              },
              // ─── 購入リンク ───────────────────────────────────────
              {
                name: "BuyLinks",
                label: "\u8CFC\u5165\u30EA\u30F3\u30AF",
                fields: [
                  { name: "title", label: "\u5546\u54C1\u540D", type: "string" },
                  { name: "image", label: "\u5546\u54C1\u753B\u50CF URL", type: "string" },
                  { name: "description", label: "\u5546\u54C1\u8AAC\u660E", type: "string" },
                  {
                    name: "links",
                    label: "\u30EA\u30F3\u30AF\u4E00\u89A7",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => ({
                        label: item?.label ?? item?.type ?? "\u30EA\u30F3\u30AF"
                      })
                    },
                    fields: [
                      {
                        name: "type",
                        label: "\u7A2E\u985E",
                        type: "string",
                        options: [
                          { value: "amazon", label: "Amazon" },
                          { value: "rakuten", label: "\u697D\u5929\u5E02\u5834" },
                          { value: "official", label: "\u516C\u5F0F\u30B5\u30A4\u30C8" }
                        ]
                      },
                      { name: "href", label: "URL", type: "string", required: true },
                      { name: "label", label: "\u30DC\u30BF\u30F3\u30C6\u30AD\u30B9\u30C8", type: "string" }
                    ]
                  }
                ]
              },
              // ─── 特徴ポイント ─────────────────────────────────────
              {
                name: "FeaturePoint",
                label: "\u7279\u5FB4\u30DD\u30A4\u30F3\u30C8",
                fields: [
                  { name: "number", label: "\u756A\u53F7", type: "number", required: true },
                  { name: "title", label: "\u30BF\u30A4\u30C8\u30EB", type: "string", required: true },
                  { name: "body", label: "\u672C\u6587", type: "rich-text" }
                ]
              },
              // ─── レビューまとめ ───────────────────────────────────
              {
                name: "ReviewSummary",
                label: "\u30EC\u30D3\u30E5\u30FC\u307E\u3068\u3081\uFF08\u826F\u3044\u70B9 / \u6C17\u306B\u306A\u308B\u70B9\uFF09",
                fields: [
                  {
                    name: "goodPoints",
                    label: "GOOD\uFF08\u826F\u3044\u70B9\uFF09",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => ({
                        label: item?.title ?? "GOOD"
                      })
                    },
                    fields: [
                      { name: "title", label: "\u30BF\u30A4\u30C8\u30EB", type: "string", required: true },
                      { name: "body", label: "\u8AAC\u660E", type: "string" }
                    ]
                  },
                  {
                    name: "conPoints",
                    label: "\u6C17\u306B\u306A\u308B\u70B9",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => ({
                        label: item?.title ?? "\u6C17\u306B\u306A\u308B\u70B9"
                      })
                    },
                    fields: [
                      { name: "title", label: "\u30BF\u30A4\u30C8\u30EB", type: "string", required: true },
                      { name: "body", label: "\u8AAC\u660E", type: "string" }
                    ]
                  }
                ]
              },
              // ─── クーポン ─────────────────────────────────────────
              {
                name: "CouponBox",
                label: "\u30AF\u30FC\u30DD\u30F3\u60C5\u5831",
                fields: [
                  { name: "body", label: "\u5185\u5BB9", type: "rich-text" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
