create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  link text not null unique,
  name text not null,
  description text,
  long_description text,
  author text,
  visible boolean not null default true,
  requires_screen boolean not null default false,
  allowed_submits integer not null default 1,
  screen jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  publish_year integer,
  publish_month integer,
  publish_day integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.surveys
  add column if not exists screen jsonb not null default '[]'::jsonb,
  add column if not exists questions jsonb not null default '[]'::jsonb;

create table if not exists public.survey_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  survey_key text not null,
  submitted boolean not null default false,
  submit_times integer not null default 0,
  submitted_screen boolean not null default false,
  passed_screen boolean not null default false,
  screen_data jsonb,
  survey_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, survey_key)
);

alter table public.profiles enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_state enable row level security;

create policy "Users can read and update only their profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read and update only their survey state"
  on public.survey_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public read access to surveys"
  on public.surveys
  for select
  using (true);

create policy "Admins can manage surveys"
  on public.surveys
  for all
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
