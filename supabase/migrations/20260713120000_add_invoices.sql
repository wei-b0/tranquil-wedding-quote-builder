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

create index invoices_owner_id_idx on public.invoices (owner_id);
create index invoices_owner_status_idx on public.invoices (owner_id, status);
create index invoices_slug_idx on public.invoices (slug);
create index invoices_expires_at_idx on public.invoices (expires_at) where status = 'trashed';

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

grant select, insert, update, delete on public.invoices to authenticated;

create policy "invoices_owner_select" on public.invoices
  for select using (owner_id = auth.uid());

create policy "invoices_owner_insert" on public.invoices
  for insert with check (owner_id = auth.uid());

create policy "invoices_owner_update" on public.invoices
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "invoices_owner_delete" on public.invoices
  for delete using (owner_id = auth.uid());
