-- Shared navbar: links + component source (used across Netlify apps)
create table public.navbar_settings (
  id int primary key default 1 check (id = 1),
  links jsonb not null default '[]'::jsonb,
  component_js text,
  updated_at timestamptz not null default now()
);

insert into public.navbar_settings (id, links)
values (
  1,
  '[
    {"id":"mcu","label":"MCU","url":"https://mcu-narrative-tracker.netlify.app/"},
    {"id":"example","label":"Example","url":"https://gmail.com"}
  ]'::jsonb
);

alter table public.navbar_settings enable row level security;

create policy "navbar_select"
  on public.navbar_settings
  for select
  to anon, authenticated
  using (true);

create policy "navbar_update"
  on public.navbar_settings
  for update
  to anon, authenticated
  using (id = 1)
  with check (id = 1);

create policy "navbar_insert"
  on public.navbar_settings
  for insert
  to anon, authenticated
  with check (id = 1);

create or replace function public.navbar_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger navbar_settings_updated_at
  before update on public.navbar_settings
  for each row
  execute function public.navbar_touch_updated_at();
