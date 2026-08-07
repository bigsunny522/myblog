// Cloudflare Pages Function: GET/POST /api/views/:slug
// D1 データベースをバックエンドにした記事閲覧数カウンター。
// D1 バインディング(変数名 DB)は Cloudflare Pages ダッシュボードの
// Settings > Functions > D1 database bindings で Production/Preview 両方に設定する。
// テーブル定義は migrations/0001_init_views.sql。詳細は docs/view-counter-setup.md 参照。
//
// @cloudflare/workers-types を依存に追加しないため、必要な型のみここで最小定義する。

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  DB: D1Database;
}

interface PagesContext {
  env: Env;
  params: Record<string, string | string[]>;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}

function getSlug(context: PagesContext): string | null {
  const { slug } = context.params;
  if (typeof slug !== 'string' || slug.length === 0) return null;
  return slug;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const slug = getSlug(context);
  if (!slug) return jsonResponse({ error: 'slug is required' }, 400);

  try {
    const row = await context.env.DB.prepare('SELECT count FROM views WHERE slug = ?')
      .bind(slug)
      .first<{ count: number }>();
    return jsonResponse({ count: row?.count ?? 0 });
  } catch (e) {
    return jsonResponse({ error: 'D1 query failed', detail: String(e) }, 500);
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const slug = getSlug(context);
  if (!slug) return jsonResponse({ error: 'slug is required' }, 400);

  try {
    const row = await context.env.DB.prepare(
      `INSERT INTO views (slug, count) VALUES (?, 1)
       ON CONFLICT(slug) DO UPDATE SET count = count + 1
       RETURNING count`
    )
      .bind(slug)
      .first<{ count: number }>();
    return jsonResponse({ count: row?.count ?? 0 });
  } catch (e) {
    return jsonResponse({ error: 'D1 query failed', detail: String(e) }, 500);
  }
}
