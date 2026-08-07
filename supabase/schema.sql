-- 記事閲覧数カウンター(components/ViewCounter.tsx)が依存する Supabase スキーマ。
-- Supabase ダッシュボードの SQL Editor でそのまま実行できる(冪等)。
-- 詳細な使い方・トラブルシューティングは docs/view-counter-setup.md を参照。

create table if not exists public.views (
  slug text primary key,
  count bigint not null default 0
);

alter table public.views enable row level security;

drop policy if exists "views are publicly readable" on public.views;
create policy "views are publicly readable"
  on public.views
  for select
  to anon
  using (true);

-- slug_text の記事を +1 し、更新後のカウントを返す。
-- security definer で実行することで、anon ロールに views テーブルへの
-- INSERT/UPDATE 権限を直接与えずに済む(RLS はこの関数を経由しない書き込みのみブロックする)。
create or replace function public.increment(slug_text text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.views (slug, count)
  values (slug_text, 1)
  on conflict (slug)
  do update set count = public.views.count + 1
  returning count into new_count;

  return new_count;
end;
$$;

grant execute on function public.increment(text) to anon;
grant select on public.views to anon;
