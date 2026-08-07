-- Cloudflare D1 用マイグレーション(記事閲覧数カウンター)。
-- Cloudflare ダッシュボードの D1 > 対象データベース > Console でそのまま実行できる(冪等)。
-- wrangler CLI を使う場合は `wrangler d1 migrations apply <DB_NAME>` でも適用可能。
-- 詳細は docs/view-counter-setup.md を参照。

CREATE TABLE IF NOT EXISTS views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
