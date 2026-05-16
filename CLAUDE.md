# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with TinaCMS watch (localhost:3000)
npm run build        # Production build: TinaCMS → next build → image optimize → sitemap
npm run build:local  # TinaCMS build only (uses .env.local)
npm run lint         # ESLint via next lint
```

The build script skips TinaCMS if `NEXT_PUBLIC_TINA_CLIENT_ID` is not set (safe for local builds without credentials).

## Architecture

**Next.js App Router** with static export (`output: 'export'` in production). All pages use `generateStaticParams()` for static generation — there are no server-rendered routes.

### Content Pipeline

Two content sources coexist and both produce the same `Post` type:

1. **Local MDX** (`content/posts/*.mdx`) — primary source; parsed by `lib/mdx.ts` using `gray-matter` + `next-mdx-remote`
2. **Notion** (optional) — `lib/notion.ts` fetches from Notion API; `scripts/notion-to-mdx.mjs` converts pages to MDX

`lib/mdx.ts` is the single entry point for post data. Key functions: `getAllPosts()`, `getPostBySlug(slug)`.

Gear items follow the same MDX pattern: `content/my-gear/*.mdx` → `lib/gear-data.ts` → `getAllGearItems()`.

### MDX Rendering

`app/blog/[slug]/page.tsx` renders MDX server-side. Custom components are mapped in `components/MDXComponents.tsx` — edit this file to change how headings, code blocks, links, etc. render inside blog posts. Custom MDX components available in post bodies: `<Text>`, `<Specs>`, `<BuyLinks>`, `<FeaturePoint>`, `<ReviewSummary>`, `<CouponBox>`.

### Images

Static export requires custom image handling. `next.config.ts` sets `loader: 'custom'` pointing to `next-image-export-optimizer`. Always use Next.js `<Image>` (or `<SafeImage>` for fallback) — raw `<img>` tags bypass optimization. Images go in `public/images/`; reference as `/images/...`.

### TinaCMS

`tina/config.ts` defines the CMS schema. The `tina/__generated__/` directory is auto-generated — do not edit manually. TinaCMS writes directly to `content/posts/*.mdx` files.

## Content Frontmatter

### Blog post (`content/posts/*.mdx`)

```yaml
---
title: ""
subtitle: ""          # optional
excerpt: ""           # used in list views and OG meta
date: "YYYY-MM-DD"
category: ""
tags: []
coverImage: "/images/blog/filename.jpg"
recommended: false    # shows in "おすすめ" tab on home
published: false      # false = hidden from all lists — set true only when ready to publish
---
```

### Gear item (`content/my-gear/*.mdx`)

```yaml
---
name: ""
category: ""          # Keyboard / Monitor / Camera / etc.
image: "/images/gear/filename.jpg"
manufacturer: ""
specs:
  "Key": "Value"
link_official: ""
link_amazon: ""
link_rakuten: ""
published: true
---
```

## Git Workflow

- **Always work on a branch** — create a new branch for each article or feature before making changes. Never commit directly to `main`.
- **Branch naming:** `post/<slug>` for articles (e.g. `post/minecraft-fabric-mod-guide`), `feat/<name>` for features, `fix/<name>` for fixes.
- **Push to main only on explicit instruction** — commit and push to the feature branch freely, but only merge/push to `main` when the user explicitly asks.

```bash
git checkout -b post/my-new-article   # start work
git checkout -b feat/new-feature
# ... commit on the branch ...
# push to main only when user says so
```

## Key Conventions

- **Path alias:** `@/` resolves to the repo root (e.g., `@/lib/mdx`, `@/components/Header`)
- **Styling:** Tailwind v4 with CSS custom properties in `app/globals.css`. Theme colors (`--primary`, `--accent`, `--background`, etc.) are defined there, not in `tailwind.config.js`
- **Japanese line breaks:** Use `<BudouxText>` component where natural Japanese wrapping matters
- **cn() helper:** `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) for conditional classNames

## Environment Variables

```
NOTION_API_KEY              # Optional: enables Notion content source
NOTION_DATABASE_ID          # Optional: paired with NOTION_API_KEY
NEXT_PUBLIC_TINA_CLIENT_ID  # TinaCMS (omit to skip TinaCMS in build)
TINA_TOKEN
NEXT_PUBLIC_SITE_URL        # Base URL for OG metadata and sitemap
NEXT_PUBLIC_SUPABASE_URL    # Optional: view counter backend
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
