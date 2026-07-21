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

create index event_media_owner_created_idx on public.event_media(owner_id, created_at desc);

create trigger event_media_set_updated_at
before update on public.event_media
for each row execute function public.set_updated_at();

alter table public.event_media enable row level security;

grant select, insert on public.event_media to authenticated;

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
