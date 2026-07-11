-- Run once against the Supabase project (SQL editor or `supabase db push`).

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'shared', 'trashed')),
  last_active_status text not null default 'draft' check (last_active_status in ('draft', 'shared')),
  client_name text not null default '',
  partner_name text not null default '',
  quote_title text not null default '',
  location text not null default '',
  trashed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload jsonb not null
);

create index quotes_owner_id_idx on public.quotes (owner_id);
create index quotes_owner_status_idx on public.quotes (owner_id, status);
create index quotes_slug_idx on public.quotes (slug);
create index quotes_expires_at_idx on public.quotes (expires_at) where status = 'trashed';

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.quotes to authenticated;

create policy "quotes_owner_select" on public.quotes
  for select using (owner_id = auth.uid());

create policy "quotes_owner_insert" on public.quotes
  for insert with check (owner_id = auth.uid());

create policy "quotes_owner_update" on public.quotes
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "quotes_owner_delete" on public.quotes
  for delete using (owner_id = auth.uid());

-- Public share page: only ever exposes a `shared` quote by exact slug, never a listing.
create or replace function public.get_shared_quote(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select payload
  from public.quotes
  where slug = p_slug
    and status = 'shared'
  limit 1;
$$;

grant execute on function public.get_shared_quote(text) to anon, authenticated;
