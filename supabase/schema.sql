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

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'trashed')),
  last_active_status text not null default 'draft' check (last_active_status in ('draft')),
  client_name text not null default '',
  invoice_title text not null default '',
  invoice_date date,
  trashed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload jsonb not null
);

create table public.sales_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  title text not null default 'Wedding Consultant',
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  width integer not null check (width > 0 and width <= 1200),
  height integer not null check (height > 0 and height <= 900),
  mime_type text not null check (mime_type = 'image/jpeg'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotes_owner_id_idx on public.quotes (owner_id);
create index quotes_owner_status_idx on public.quotes (owner_id, status);
create index quotes_slug_idx on public.quotes (slug);
create index quotes_expires_at_idx on public.quotes (expires_at) where status = 'trashed';
create index invoices_owner_id_idx on public.invoices (owner_id);
create index invoices_owner_status_idx on public.invoices (owner_id, status);
create index invoices_slug_idx on public.invoices (slug);
create index invoices_expires_at_idx on public.invoices (expires_at) where status = 'trashed';
create index event_media_owner_created_idx on public.event_media (owner_id, created_at desc);

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

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger sales_profiles_set_updated_at
before update on public.sales_profiles
for each row execute function public.set_updated_at();

create trigger event_media_set_updated_at
before update on public.event_media
for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;
alter table public.invoices enable row level security;
alter table public.sales_profiles enable row level security;
alter table public.event_media enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.quotes to authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.sales_profiles to authenticated;
grant select, insert on public.event_media to authenticated;

create policy "quotes_owner_select" on public.quotes
  for select using (owner_id = auth.uid());

create policy "quotes_owner_insert" on public.quotes
  for insert with check (owner_id = auth.uid());

create policy "quotes_owner_update" on public.quotes
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "quotes_owner_delete" on public.quotes
  for delete using (owner_id = auth.uid());

create policy "invoices_owner_select" on public.invoices
  for select using (owner_id = auth.uid());

create policy "invoices_owner_insert" on public.invoices
  for insert with check (owner_id = auth.uid());

create policy "invoices_owner_update" on public.invoices
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "invoices_owner_delete" on public.invoices
  for delete using (owner_id = auth.uid());

create policy "sales_profiles_owner_select" on public.sales_profiles
  for select using (user_id = auth.uid());

create policy "sales_profiles_owner_insert" on public.sales_profiles
  for insert with check (user_id = auth.uid());

create policy "sales_profiles_owner_update" on public.sales_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "sales_profiles_owner_delete" on public.sales_profiles
  for delete using (user_id = auth.uid());

create policy "event_media_owner_select" on public.event_media
  for select using (owner_id = auth.uid());

create policy "event_media_owner_insert" on public.event_media
  for insert with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-event-images',
  'quote-event-images',
  true,
  5242880,
  array['image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "event_media_object_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'quote-event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_media_object_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'quote-event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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

create or replace function public.get_public_quote_view(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with quote_match as (
    select
      q.payload,
      q.owner_id,
      case
        when coalesce(q.payload->>'creatorUserId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then (q.payload->>'creatorUserId')::uuid
        else q.owner_id
      end as creator_id
    from public.quotes q
    where q.slug = p_slug
      and q.status = 'shared'
    limit 1
  )
  select jsonb_build_object(
    'quote',
    jsonb_set(payload, '{creatorUserId}', to_jsonb(creator_id::text), true),
    'salesProfile',
    case
      when sp.user_id is null then null
      else jsonb_build_object(
        'userId', sp.user_id,
        'displayName', sp.display_name,
        'title', sp.title,
        'email', sp.email,
        'phone', sp.phone,
        'whatsapp', sp.whatsapp,
        'avatarUrl', sp.avatar_url
      )
    end
  )
  from quote_match
  left join public.sales_profiles sp on sp.user_id = quote_match.creator_id;
$$;

grant execute on function public.get_public_quote_view(text) to anon, authenticated;
