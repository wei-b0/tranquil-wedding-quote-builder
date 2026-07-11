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

create trigger sales_profiles_set_updated_at
before update on public.sales_profiles
for each row execute function public.set_updated_at();

alter table public.sales_profiles enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.sales_profiles to authenticated;

create policy "sales_profiles_owner_select" on public.sales_profiles
  for select using (user_id = auth.uid());

create policy "sales_profiles_owner_insert" on public.sales_profiles
  for insert with check (user_id = auth.uid());

create policy "sales_profiles_owner_update" on public.sales_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "sales_profiles_owner_delete" on public.sales_profiles
  for delete using (user_id = auth.uid());

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
