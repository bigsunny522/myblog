interface D1PreparedStatement { bind(...values: unknown[]): D1PreparedStatement; first<T = Record<string, unknown>>(): Promise<T | null>; }
interface D1Result<T = Record<string, unknown>> { results: T[]; }
interface D1Database { prepare(query: string): D1PreparedStatement; batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>; }
interface Env { DB?: D1Database; ASSETS: { fetch(input: Request | URL | string): Promise<Response> }; }
interface PagesContext { request: Request; env: Env; params: Record<string, string | string[]>; }

const json = (body: Record<string, unknown>, status = 200): Response => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const getSlug = (context: PagesContext): string | null => {
  const slug = context.params.slug;
  return typeof slug === 'string' && /^[a-z0-9-]{1,100}$/.test(slug) ? slug : null;
};

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
  const slug = getSlug(context);
  if (!slug) return json({ error: 'invalid slug' }, 400);
  if (!context.env.DB) return json({ error: 'db not configured' }, 503);
  try {
    const row = await context.env.DB.prepare('SELECT count FROM views WHERE slug = ?1').bind(slug).first<{ count: number }>();
    return json({ count: row?.count ?? 0 });
  } catch (error) { console.error(error); return json({ error: 'internal error' }, 500); }
};

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  const slug = getSlug(context);
  if (!slug) return json({ error: 'invalid slug' }, 400);
  if (!context.env.DB) return json({ error: 'db not configured' }, 503);
  try {
    const asset = await context.env.ASSETS.fetch(new URL(`/blog/${slug}`, context.request.url));
    if (!asset.ok) return json({ error: 'not found' }, 404);
    const result = await context.env.DB.batch([
      context.env.DB.prepare('INSERT INTO views (slug, count) VALUES (?1, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1').bind(slug),
      context.env.DB.prepare('SELECT count FROM views WHERE slug = ?1').bind(slug),
    ]);
    return json({ count: result[1]?.results[0]?.count ?? 0 });
  } catch (error) { console.error(error); return json({ error: 'internal error' }, 500); }
};
