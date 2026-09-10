# 仕様書: 閲覧数カウンターを Cloudflare Pages Functions + D1 に置き換える

作成: 2026-09-10 / ブランチ: `feat/view-counter-d1`

## 1. 背景

記事ページの閲覧数(`components/ViewCounter.tsx`)は Supabase をバックエンドにしている。Supabase の無料プロジェクトは無操作が続くと一時停止するため、連携がすぐ切れる。

2026-09-10 に本番(`https://xyzack271.com/blog/benq-screenbar-halo2-review`)で確認したところ、Supabase への通信が1件も発生せず、表示された数値は `ViewCounter.tsx` のデモモードが slug から算出するダミー値(734 → 1.5秒後に 735)と一致した。**本番の読者に偽の閲覧数を見せている状態**になっている。

これを、デプロイ先と同じ Cloudflare 内で完結する **Pages Functions + D1** に置き換える。あわせてデモモード(ダミー値の表示)を廃止する。

## 2. 設計

```
記事ページ(静的HTML)
  └ ViewCounter(クライアント)
       ├ そのセッションで初めて見る記事 → POST /api/views/<slug> → 加算して {count} を返す
       └ 2回目以降                    → GET  /api/views/<slug> → {count} を返す
                                             │
                          functions/api/views/[slug].ts(Pages Functions)
                                             │
                                  D1(バインド名 DB、テーブル views)
```

- Pages Functions は Next.js とは独立した仕組みで、リポジトリ直下の `functions/` を Cloudflare Pages が自動でデプロイする。**Next.js の Route Handler(`app/api/**`)は使わない**(`output: 'export'` のため本番で動かない)
- D1 のテーブル作成とバインド設定はユーザーがダッシュボードで行う(手順: `docs/setup-view-counter-d1.md`)。実装側は、バインドが無い状態でも壊れないことだけを保証する

### 2.1 D1 スキーマ(参考。実装側で作成・実行はしない)

```sql
CREATE TABLE IF NOT EXISTS views (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
```

### 2.2 API 仕様: `functions/api/views/[slug].ts`(新規)

ルーティングはファイル名で決まる。`/api/views/<slug>` にマッチし、`context.params.slug` に slug が入る。

| メソッド | 処理 | 成功時 |
|---|---|---|
| `POST` | slug を1加算し、加算後の値を返す | `200` `{ "count": <number> }` |
| `GET` | 現在の値を返す。行が無ければ 0 | `200` `{ "count": <number> }` |

共通の処理:

1. `context.params.slug` を取り出す。文字列でない場合(配列など)や `^[a-z0-9-]{1,100}$` にマッチしない場合は `400` `{ "error": "invalid slug" }`
2. `context.env.DB` が未定義なら `503` `{ "error": "db not configured" }`(バインド設定前やローカルでも例外で落とさない)
3. D1 の呼び出しで例外が出たら `500` `{ "error": "internal error" }`。例外の中身はレスポンスに出さず、`console.error` で出力する
4. すべてのレスポンスを JSON にし、ヘッダー `Content-Type: application/json; charset=utf-8` と `Cache-Control: no-store` を付ける

POST だけの追加処理(**実在しない slug で行が増えるのを防ぐ**):

5. D1 に書く前に `context.env.ASSETS.fetch(new URL(\`/blog/${slug}\`, context.request.url))` を呼び、`response.ok` が false なら `404` `{ "error": "not found" }` を返して D1 には書かない。`ASSETS.fetch` には pretty path(`.html` なし)を渡す(Cloudflare の仕様)
6. 加算は、次の2文を `DB.batch([...])` で1回の呼び出しとして実行する。D1 の `batch` はトランザクションとして扱われる。`RETURNING` は D1 のドキュメントで対応が明記されていないので使わない

```sql
INSERT INTO views (slug, count) VALUES (?1, 1)
  ON CONFLICT(slug) DO UPDATE SET count = count + 1;
SELECT count FROM views WHERE slug = ?1;
```

  batch の2つ目の結果の `results[0].count` を返す。

GET の処理:

```sql
SELECT count FROM views WHERE slug = ?1;
```

`.first()` の結果が `null` なら `0` を返す。GET では手順5(ASSETS による実在確認)は行わない。

`onRequestGet` と `onRequestPost` 以外のハンドラ(`onRequest` など)は定義しない。

**型定義**: `@cloudflare/workers-types` は**追加しない**(Codex の環境はネットワークに出られず npm install できないため)。関数ファイルの先頭に、使う分だけの最小限の型をファイル内で定義する。例:

```ts
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}
interface D1Result<T = Record<string, unknown>> {
  results: T[];
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
interface Env {
  DB?: D1Database;
  ASSETS: { fetch(input: Request | URL | string): Promise<Response> };
}
interface PagesContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}
export const onRequestGet = async (context: PagesContext): Promise<Response> => { /* ... */ };
export const onRequestPost = async (context: PagesContext): Promise<Response> => { /* ... */ };
```

このファイルはルートの `tsconfig.json`(`include: **/*.ts`)の型チェック対象に入る。`tsconfig.json` は変更せず、ルートの設定のままで型エラーが出ないように書く。

### 2.3 ルーティング制限: `public/_routes.json`(新規)

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

`public/` の中身は `next build` で `out/` にそのままコピーされる。記事ページなどの静的アセットへのアクセスで Functions が起動しないようにするためのファイルで、Functions の起動は無料枠(Workers と共有で1日10万リクエスト)を消費し、静的アセットへのアクセスは消費しない。

### 2.4 クライアント: `components/ViewCounter.tsx`(書き換え)

- `'use client'`。`export const ViewCounter = ({ slug }: { slug: string })` のシグネチャ(名前付きエクスポート)は維持する
- **削除する**: Supabase の import、`isDemoMode` とダミー値を生成するコード一式、読み込み中のスケルトン表示
- state は `count: number | null`(初期値 `null`)の1つだけにする
- `useEffect`(依存配列は `[slug]`):
  1. `const key = \`viewed_${slug}\``。`sessionStorage.getItem(key) === 'true'` なら GET、それ以外は POST にする。`sessionStorage` へのアクセスは try/catch で囲み、例外が出たら POST 扱いにする
  2. `fetch(\`/api/views/${encodeURIComponent(slug)}\`, { method, signal })`。`AbortController` を使い、cleanup で `abort()` する
  3. `res.ok` が true、かつ JSON の `count` が `typeof === 'number'` で `Number.isFinite` のときだけ `setCount(count)` する。POST が成功した場合は `sessionStorage.setItem(key, 'true')` も行う(try/catch で囲む)
  4. それ以外(404 / 503 / ネットワークエラー / JSON のパース失敗 / abort)は何もしない。`console` にも出さない。ローカルの `next dev` では `/api/views/*` が存在せず 404 になるが、それが正常な動作
- 描画:
  - `count === null` のときは `null` を返す(何も表示しない)
  - 値が取れたら、区切りと本体を Fragment で返す。区切りを ViewCounter 側に持たせる理由は、非表示のときに区切り「•」だけが残らないようにするため

```tsx
<>
  <span className="mx-2 hidden sm:inline">•</span>
  <span className="hidden sm:inline-flex items-center gap-1" title="閲覧数">
    <Eye className="w-3.5 h-3.5" />
    {count.toLocaleString('ja-JP')}
  </span>
</>
```

### 2.5 記事ページ: `app/blog/[slug]/page.tsx`(最小限の変更)

284〜287行目の、区切り1つと ViewCounter を包む span を、`<ViewCounter slug={slug} />` の1行に置き換える。

変更前:
```tsx
                <span className="mx-2 hidden sm:inline">•</span>
                <span className="hidden sm:inline-flex">
                  <ViewCounter slug={slug} />
                </span>
```
変更後:
```tsx
                <ViewCounter slug={slug} />
```

このファイルのそれ以外の箇所(JSON-LD、import、ほかのメタ情報表示)は触らない。

### 2.6 削除: `lib/supabaseClient.ts`

ファイルごと削除する。ほかに import しているコードは無い(`components/ViewCounter.tsx` だけ)。

## 3. 変更対象

**Codex が触るファイル(これ以外は触らない)**

| ファイル | 操作 |
|---|---|
| `functions/api/views/[slug].ts` | 新規 |
| `public/_routes.json` | 新規 |
| `components/ViewCounter.tsx` | 書き換え |
| `app/blog/[slug]/page.tsx` | 284〜287行目のみ置き換え |
| `lib/supabaseClient.ts` | 削除 |

**Codex が触らないファイル**

- `package.json` / `package-lock.json` — `@supabase/supabase-js` の削除は `npm uninstall` がネットワークを使うため、レビュー担当(Claude Code)側で実行する
- `tsconfig.json` / `next.config.ts` / `eslint.config.mjs`
- `AGENTS.md` / `docs/**` — レビュー担当側で更新する
- `app/portfolio/page.tsx`(技術スタックの一覧に `'Supabase'` という文字列があるが、表示用の文字列なので残す)
- `content/**`(過去記事の Supabase への言及は当時の記録として残す)

## 4. 受け入れ条件

### Codex が実行して通すもの(Windows では `npx.cmd` を使う)

1. `npx.cmd tsc --noEmit` が exit 0
2. `npx.cmd eslint components/ViewCounter.tsx "app/blog/[slug]/page.tsx" "functions/api/views/[slug].ts"` が exit 0(2026-09-10 の時点で、既存の2ファイルの指摘は0件)
3. `rg -n -i supabase components lib app functions` のヒットが `app/portfolio/page.tsx` の1件だけ
4. `Test-Path lib/supabaseClient.ts` が `False`
5. `Get-Content -Raw -Encoding utf8 public/_routes.json | ConvertFrom-Json` がエラーにならず、`include` が `/api/*` の1要素だけ

### レビュー担当(Claude Code)が実行するもの(Codex は実行しない)

6. `npm uninstall @supabase/supabase-js` の後で `npx next build` が成功する(`npm run build` は IndexNow に送信するので使わない)
7. `out/_routes.json` が存在し、中身が `public/_routes.json` と一致する
8. `out/` の中に `placeholder.supabase.co` という文字列が無い
9. 本番へのデプロイ後(ユーザーが D1 を設定した後): 記事ページを開くと `POST /api/views/<slug>` が 200 を返し、リロードすると GET に切り替わり、別セッションで開くと数値が1増える

## 5. 対象外

- 記事一覧・カードへの閲覧数表示
- Supabase からの過去データの移行(0から数え直す)
- ボット・連打対策の強化(同一セッションの二重カウント防止は今と同じ `sessionStorage` 方式のまま。POST を直接叩いて水増しすることは防がない)
- ローカルで Functions を動かす開発環境(`wrangler pages dev`)の整備
- D1 データベースの作成・バインド設定(ユーザーがダッシュボードで行う)

## 6. 想定される落とし穴

- **`functions/` は Next.js のビルドとは無関係**。`next build` は `functions/` を無視し、Cloudflare Pages がデプロイ時に別途ビルドする。そのためローカルの `next build` が通っても Functions の実行時エラーは検出できない。型チェック(`tsc`)と、デプロイ後の本番での確認(受け入れ条件9)で担保する
- **ルートの `tsconfig.json` の対象に `functions/` が入る**。`lib` は `dom` なので `Request` / `Response` / `URL` はそのまま使える。Workers 固有の型(`D1Database` / `PagesFunction` など)はグローバルに存在しないので、2.2 の通りファイル内で定義する。`@cloudflare/workers-types` を import しない
- **`ASSETS.fetch` のパス**: 静的エクスポートの出力は `out/blog/<slug>.html`。Cloudflare Pages はこれを `/blog/<slug>` として配信するので、`.html` を付けずに渡す
- **React StrictMode**: 開発時は effect が2回実行されるので、POST が2回飛びうる。cleanup で abort するため state の更新は1回で済む。本番には影響しない。ローカルには `/api` 自体が無い
- **既存の区切り「•」**: page.tsx 側の区切りを消し忘れると、カウンターが非表示のときに「•」が二重に並ぶ。2.5 の置き換えは区切りを含めて行う
- **表示幅**: 今と同じく `sm` 未満では閲覧数を表示しない(`hidden sm:*`)
- **エンコーディング**: このファイルを含め、リポジトリの `.md` は BOM 無しの UTF-8。PowerShell で読むときは `Get-Content -Raw -Encoding utf8` を使う
