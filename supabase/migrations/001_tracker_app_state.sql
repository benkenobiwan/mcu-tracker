-- MCU Tracker: single-row app state (timeline items + start date)
create table public.tracker_app_state (
  id int primary key default 1 check (id = 1),
  start_date date not null default '2026-05-04',
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.tracker_app_state (id, start_date, items)
values (1, '2026-05-04', '[]'::jsonb);

alter table public.tracker_app_state enable row level security;

-- Personal single-user app: anon key in your static site is the access boundary.
-- Do not commit config.js or share your project keys publicly.
create policy "tracker_select"
  on public.tracker_app_state
  for select
  to anon, authenticated
  using (true);

create policy "tracker_update"
  on public.tracker_app_state
  for update
  to anon, authenticated
  using (id = 1)
  with check (id = 1);

create policy "tracker_insert"
  on public.tracker_app_state
  for insert
  to anon, authenticated
  with check (id = 1);

create or replace function public.tracker_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tracker_app_state_updated_at
  before update on public.tracker_app_state
  for each row
  execute function public.tracker_touch_updated_at();
